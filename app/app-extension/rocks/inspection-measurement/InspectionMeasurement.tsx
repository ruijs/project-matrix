/* eslint-disable array-callback-return */
import { type Rock } from "@ruiapp/move-style";
import type { TableProps } from "antd";
import { Alert, Button, Form, InputNumber, message, Modal, Select, Space, Spin, Table, Tag } from "antd";
import { useDebounceFn, useSetState } from "ahooks";
import { v4 as uuidv4 } from "uuid";
import rapidApi from "~/rapidApi";
import { find, get, map, orderBy, split } from "lodash";
import rapidAppDefinition from "~/rapidAppDefinition";
import { useEffect, useState } from "react";
import { calculateInspectionResult } from "~/utils/calculate";
import { fmtCharacteristicNorminal } from "~/utils/fmt";

export default {
  $type: "inspectionMeasurement",

  slots: {},

  propertyPanels: [],

  Renderer(context, props, state) {
    const Info = context?.scope.stores.detail.data?.list[0];
    const [form] = Form.useForm();
    const [unSkippableArr, setUnSkippableArr] = useState<any>([]);
    const [selected, setSelected] = useState<any>([]);
    const [validateOpen, setValidateOpen] = useState<boolean>(false);
    const [resultState, setResultState] = useState<boolean>(false);
    const { loadInpsectionMeasurement, loading, inspection, setState } = useInpsectionMeasurement({
      ruleId: Info?.rule?.id,
      sheetId: Info?.id,
      round: Info?.round,
      sampleCount: Info?.sampleCount,
    });

    const { submitInspectionMeasurement } = useCreateInspectionMeasurement({
      sheetId: Info?.id,
      round: Info?.round,
      onSuccess: () => {
        history.go(0);
      },
    });

    const { update } = useUpdateInspectionMeasurement({
      sheetId: Info?.id,
      onSuccess() {},
    });

    const { modal, actionPop } = useConfigForm({ sheetId: Info?.id, onOk: () => {} });

    const tableColumns: TableProps<any>["columns"] = [
      {
        title: "样本号",
        dataIndex: "code",
        width: 120,
        render: (_) => _ || "",
      },
      {
        title: "检验项",
        dataIndex: "name",
        width: 180,
      },
      {
        title: "检验仪器",
        dataIndex: "instrument",
        width: 180,
        render: (_) => {
          return get(_, "code") || "-";
        },
      },
      {
        title: "标准值",
        dataIndex: "norminal",
        width: 180,
        render: (_, r) => {
          return fmtCharacteristicNorminal(r);
        },
      },
      {
        title: "实测值",
        dataIndex: "measuredValue",
        render: (_, r, idx) => {
          const onRecordChange = (v: any) => {
            const changedInspection = inspection?.map((item) => {
              return {
                ...item,
                items: item.items.map((i: any) => {
                  if (i.uuid === r.uuid) {
                    return {
                      ...i,
                      measuredValue: v,
                      qualitativeValue: r.kind === "qualitative" ? v : "",
                      quantitativeValue: r.kind === "quantitative" ? v : "",
                    };
                  } else {
                    return i;
                  }
                }),
              };
            });
            update({
              id: r.measurementsId,
              round: r.round,
              isQualified: calculateInspectionResult(r, v),
              qualitativeValue: r.kind === "qualitative" ? v : "",
              quantitativeValue: r.kind === "quantitative" ? v : "",
            });
            setState({
              inspection: changedInspection,
            });
          };

          switch (r.kind) {
            case "quantitative":
              return (
                <InputNumber
                  placeholder="请输入"
                  disabled={r.locked}
                  style={{ width: "100%", maxWidth: 260 }}
                  value={r.measuredValue}
                  onChange={(v) => {
                    onRecordChange(v);
                  }}
                />
              );
            case "qualitative":
              const dictionary = find(rapidAppDefinition.dataDictionaries, (d) => d.code === "QualitativeInspectionDetermineType");
              const item = find(get(dictionary, "entries"), (entry) => entry.value === r?.qualitativeDetermineType);
              const options = map(split(get(item, "name"), "-"), (v) => ({ label: v, value: v }));
              return (
                <Select
                  options={options}
                  disabled={r.locked}
                  placeholder="请选择"
                  style={{ width: "100%", maxWidth: 260 }}
                  value={r.measuredValue}
                  onChange={(v) => {
                    onRecordChange(v);
                  }}
                />
              );
          }
        },
      },
      {
        title: "判定",
        dataIndex: "result",
        width: 300,
        render: (_, r) => {
          const isOk = calculateInspectionResult(r, r.measuredValue);

          if (isOk == null) {
            return;
          }

          return isOk ? <Tag color="green">合格</Tag> : <Tag color="red">不合格</Tag>;
        },
      },
    ];

    const checkCofigInit = () => {
      let formItems = [];
      if (!Info?.rule?.id) {
        formItems.push({
          name: "rule",
          type: "select",
          label: "检验规则",
        });
      }
      if (!Info?.sampleCount) {
        formItems.push({
          name: "sampleCount",
          type: "number",
          label: "样本数量",
        });
      }
      if (!Info?.sampleCount || !Info?.rule?.id) {
        actionPop(true, formItems);
      }
    };

    useEffect(() => {
      if (Info) {
        checkCofigInit();
        if (Info?.rule?.id) {
          loadInpsectionMeasurement();
        }
      }
    }, [Info]);

    const formatTableData = (arr: any) => {
      const result = arr?.map((item: any) => {
        const v = item.items[0]?.kind === "quantitative" ? item.items[0]?.quantitativeValue : item.items[0]?.qualitativeValue;
        return {
          code: item.code,
          ...item.items[0],
          round: item.round,
          isQualified: calculateInspectionResult(item.items[0], v),
          items: item.items
            .map((it: any) => {
              const v = it.kind === "quantitative" ? it.quantitativeValue : it.qualitativeValue;
              return {
                parentCode: item.code,
                isQualified: calculateInspectionResult(it, v),
                ...it,
              };
            })
            .slice(1, item.items.lenght),
        };
      });

      return orderBy(result, "code");
    };

    const validateMeasurment = async (sheetId: string) => {
      let isSkippableArr: any[] = [];
      inspection?.map((item) => {
        const unSkippable = item.items.filter((it: any) => !it.skippable).filter((i: any) => !i.qualitativeValue && !i.quantitativeValue);
        if (unSkippableArr.length > 0) {
          isSkippableArr.push({
            code: item.code,
            unSkippable,
          });
        }
      });
      setUnSkippableArr(orderBy(isSkippableArr, "code"));
      if (isSkippableArr.length > 0) {
        setValidateOpen(true);
      } else {
        await rapidApi
          .patch(`/mom/mom_inspection_sheets/${sheetId}`, {
            state: "inspected",
          })
          .then(async (res) => {
            if (res.data.result === "qualified") {
              setResultState(res.data.result === "qualified");
              history.go(0);
            } else {
              setValidateOpen(true);
            }
          });
      }
    };

    const validateErrorModal = (
      <Modal
        title="温馨提示"
        open={validateOpen}
        footer={
          <Space>
            <Button
              type="default"
              onClick={() => {
                setValidateOpen(false);
              }}
            >
              取消
            </Button>
            <Button
              type="primary"
              disabled={unSkippableArr.length > 0 || !resultState}
              onClick={() => {
                form.validateFields().then(async (res) => {
                  const { treatment } = res;
                  try {
                    await rapidApi
                      .patch(`/mom/mom_inspection_sheets/${Info?.id}`, {
                        treatment,
                      })
                      .then(async (res) => {
                        setResultState(res.data.result !== "qualified");
                      });
                  } catch {
                    setValidateOpen(false);
                  }
                });
              }}
            >
              确定
            </Button>
          </Space>
        }
      >
        {resultState ? (
          <Form form={form}>
            <Form.Item
              label="处理结果"
              name="treatment"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                options={[
                  { label: "特采", value: "special", color: "orange" },
                  { label: "退货", value: "withdraw", color: "red" },
                ]}
              />
            </Form.Item>
          </Form>
        ) : (
          <>
            <Alert style={{ marginBottom: 10 }} message="检测到当前当前检验单，有以下检验不可跳过。请完成检验！明细如下：" />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {unSkippableArr.map((item: any, index: number) => {
                return (
                  <div key={index} style={{ marginBottom: 5 }}>
                    <span>样本号：</span>
                    <span style={{ color: "red" }}>{item.code}</span>
                    {item?.unSkippable?.map((it: any, index: number) => {
                      return (
                        <div key={index}>
                          <span>检验项：</span>
                          <span style={{ color: "red" }}>{it.name}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Modal>
    );
    return (
      <div className="pm_inspection-input-sectioN">
        <Spin spinning={loading || false}>
          {inspection &&
            inspection.map((item: any) => {
              return (
                <div key={item.id}>
                  <div className="inspection_measurement--title">{item.roundTitle}:</div>
                  {item.round === Info?.round && (
                    <div className="pm_inspection-measurement--footer">
                      <Space>
                        <Button
                          type="primary"
                          disabled={!(Info?.state !== "inspected")}
                          onClick={() => {
                            validateMeasurment(Info?.id);
                          }}
                        >
                          提交检验记录
                        </Button>
                        <Button
                          type="primary"
                          style={Info.state !== "inspected" ? { display: "none" } : {}}
                          disabled={Info.state === "inspected" && selected.length <= 0}
                          onClick={() => {
                            let res: any[] = [];

                            inspection?.map((item) => {
                              const filterItem = item.items.filter((it: any) => selected.includes(it.uuid));

                              if (filterItem.length > 0) {
                                res.push({
                                  ...item,
                                  items: filterItem,
                                });
                              }
                            });

                            submitInspectionMeasurement(res, true);
                          }}
                        >
                          复检
                        </Button>
                      </Space>
                    </div>
                  )}

                  <Table
                    size="middle"
                    rowClassName={() => "editable-row"}
                    rowKey={(record, index) => record?.uuid || index}
                    rowSelection={{
                      type: "checkbox",
                      hideSelectAll: true,
                      onChange: (selectedRowKeys, selectedRows) => {
                        setSelected([...selected, selectedRowKeys[0]]);
                      },
                      getCheckboxProps: (record) => ({
                        disabled: record.round === Info.round ? record?.isQualified : record?.locked,
                      }),
                    }}
                    expandable={{
                      expandedRowRender: (record) => (
                        <Table
                          scroll={{ x: 700 }}
                          rowKey={(record, index) => record?.uuid || index}
                          columns={tableColumns}
                          rowSelection={{
                            type: "checkbox",
                            onChange: (selectedRowKeys, selectedRows) => {
                              setSelected([...selected, selectedRowKeys[0]].filter((item) => item));
                            },
                            hideSelectAll: true,
                            getCheckboxProps: (record) => ({
                              disabled: record.round === Info.round ? record?.isQualified : record?.locked,
                            }),
                          }}
                          showHeader={false}
                          dataSource={record.items}
                          pagination={false}
                        />
                      ),
                      defaultExpandedRowKeys: ["0"],
                    }}
                    columns={tableColumns}
                    dataSource={formatTableData([item]) || []}
                    pagination={false}
                    scroll={{ x: 700 }}
                  />
                </div>
              );
            })}
        </Spin>
        {modal}
        {validateErrorModal}
      </div>
    );
  },
} as Rock<any>;

interface InpsectionData {
  loading?: boolean;
  inspection?: any[];
}

interface ICheckRuleData {
  checkRules?: any[];
}

function useInpsectionMeasurement(props: { ruleId: string; round: number; sheetId: string; sampleCount: number }) {
  const { ruleId, sheetId, sampleCount, round } = props;
  const [state, setState] = useSetState<InpsectionData>({});
  const { submitInspectionMeasurement } = useCreateInspectionMeasurement({
    sheetId: sheetId,
    round,
    onSuccess: () => {
      history.go(0);
    },
  });

  const loadInpsectionMeasurement = async () => {
    if (state.loading) {
      return;
    }
    setState({ loading: true });
    try {
      const res = await rapidApi.post("/mom/mom_inspection_sheet_samples/operations/find", {
        filters: [
          {
            field: "sheet",
            operator: "eq",
            value: sheetId,
          },
        ],
        relations: {
          measurements: {
            properties: ["id", "isQualified", "qualitativeValue", "quantitativeValue", "sampleCode", "instrument", "characteristic", "locked", "round"],
          },
        },
        pagination: { limit: 1000, offset: 0 },
        properties: ["id", "code", "sheet", "measurements", "round"],
      });
      const measurements = res.data.list;

      const measurementIsNull = res.data.list.every((item: any) => item.measurements.length <= 0);

      if (measurementIsNull) {
        const inpsectionRule = await rapidApi.post("/mom/mom_inspection_characteristics/operations/find", {
          filters: [
            {
              field: "rule",
              operator: "eq",
              value: ruleId,
            },
          ],
          pagination: { limit: 1000, offset: 0 },
          properties: [
            "id",
            "rule",
            "name",
            "skippable",
            "category",
            "method",
            "instrumentCategory",
            "instrument",
            "kind",
            "determineType",
            "qualitativeDetermineType",
            "norminal",
            "upperTol",
            "lowerTol",
            "upperLimit",
            "lowerLimit",
            "config",
          ],
        });

        const inspection = inpsectionRule.data.list;

        let sampleArr = [];

        for (let i = 1; i <= sampleCount; i++) {
          sampleArr.push(i);
        }

        const formateArr = sampleArr.map((item: any) => {
          return {
            code: item,
            sheetId: sheetId,
            round: item.round,
            items: inspection.map((i: any) => {
              return {
                ...i,
                uuid: uuidv4(),
              };
            }),
          };
        });

        submitInspectionMeasurement(formateArr, false);
      } else {
        const formateArr = measurements.map((item: any) => {
          return {
            code: item.code,
            id: item.id,
            sheetId: sheetId,
            round: item.round,
            roundTitle: `第${item.round}轮次检验`,
            items: item.measurements.map((i: any) => {
              return {
                ...i.characteristic,
                measurementsId: i.id,
                instrument: i.instrument,
                uuid: uuidv4(),
                locked: i.locked,
                quantitativeValue: i.quantitativeValue,
                qualitativeValue: i.qualitativeValue,
                measuredValue: i.characteristic?.kind === "qualitative" ? i.qualitativeValue : i.quantitativeValue,
              };
            }),
          };
        });
        setState({
          inspection: formateArr || [],
        });
      }
    } finally {
      setState({ loading: false });
    }
  };

  return { loadInpsectionMeasurement, ...state, setState };
}

function useCreateInspectionMeasurement(options: { sheetId: string; round: number; onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const submitInspectionMeasurement = async (inspection: any, isReCheck?: boolean) => {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    const params = {
      entities: inspection.map((item: any) => {
        return {
          code: item.code,
          sheet_id: options.sheetId,
          round: isReCheck ? options?.round + 1 : 1,
          measurements: item.items.map((it: any) => {
            return {
              instrument: {
                id: item.items.find((i: any) => i.uuid === it.uuid)?.instrument?.id,
              },
              isQualified: calculateInspectionResult(it, it.measuredValue),
              sampleCode: item.code,
              quantitativeValue: it.quantitativeValue || null,
              qualitativeValue: it.qualitativeValue || null,
              characteristic: {
                id: item.items.find((i: any) => i.uuid === it.uuid)?.id,
              },
            };
          }),
        };
      }),
    };

    if (isReCheck) {
      const params = {
        state: "pending",
        approvalState: "approving",
        round: options?.round + 1,
      };
      await rapidApi.patch(`/mom/mom_inspection_sheets/${options?.sheetId}`, params);
    }

    await rapidApi
      .post("/mom/mom_inspection_sheet_samples/operations/create_batch", params)
      .then((res) => {
        if (res.status >= 200 && res.status < 400) {
          options.onSuccess?.();
        }
        setSubmitting(false);
      })
      .catch(() => {
        setSubmitting(false);
      });
  };

  const submitFn = useDebounceFn(submitInspectionMeasurement, { wait: 300 });

  return { submitting, submitInspectionMeasurement: submitFn.run };
}

function useUpdateInspectionMeasurement(options: { sheetId: string; onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const update = async (inspectionItem: any) => {
    if (submitting) {
      return;
    }
    setSubmitting(true);

    const params = {
      isQualified: inspectionItem.isQualified,
      round: inspectionItem.round,
      quantitativeValue: inspectionItem.quantitativeValue || null,
      qualitativeValue: inspectionItem.qualitativeValue || null,
    };

    await rapidApi
      .patch(`/mom/mom_inspection_measurements/${inspectionItem.id}`, params)
      .then((res) => {
        if (res.status >= 200 && res.status < 400) {
          options.onSuccess?.();
        }
        setSubmitting(false);
      })
      .catch(() => {
        setSubmitting(false);
      });
  };
  return { submitting, update };
}

function useSetCofigCheckRule(options: { sheetId: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [state, setState] = useSetState<ICheckRuleData>({});
  const loadCheckRuleList = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    await rapidApi
      .post(`/mom/mom_inspection_rules/operations/find`, {
        orderBy: [
          {
            field: "id",
          },
        ],
        properties: [],
      })
      .then((res) => {
        setState({
          checkRules: res.data.list.map((item: any) => {
            return {
              label: item.name,
              value: item.id,
            };
          }),
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };
  const setConfigCheckRule = async (params: { rule?: number; sampleCount?: number }) => {
    const { rule, sampleCount } = params;
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const params = {
        rule,
        sampleCount,
      };
      await rapidApi
        .patch(`/mom/mom_inspection_sheets/${options?.sheetId}`, params)
        .then((res) => {
          message.success("设置成功");
        })
        .catch(() => {
          message.success("设置失败");
        });
    } finally {
      setSubmitting(false);
    }
  };
  return { loading, ...state, loadCheckRuleList, setConfigCheckRule };
}

function useConfigForm(options: { sheetId: string; onOk: (value: any) => void }) {
  const { onOk } = options;
  const [open, setOpen] = useState<boolean>(false);
  const [formItems, setFormItems] = useState<any[]>([]);
  const [form] = Form.useForm();
  const { checkRules, loadCheckRuleList, setConfigCheckRule } = useSetCofigCheckRule({ sheetId: options?.sheetId });

  const modal = (
    <Modal
      title="温馨提示"
      open={open}
      destroyOnClose
      closable={false}
      footer={
        <Button
          type="primary"
          onClick={() => {
            form.validateFields().then((res) => {
              onOk(res);
              setConfigCheckRule(res);
              history.go(0);
            });
          }}
        >
          提交
        </Button>
      }
    >
      <Alert message="提示：检测到当前检验单配置异常，请补全以下配置" type="error" />
      <Form style={{ marginTop: 20 }} form={form} labelCol={{ span: 6 }}>
        {formItems.map((item, index) => {
          return (
            <Form.Item key={index} name={item.name} label={item.label} rules={[{ required: true }]}>
              {item.type === "select" ? <Select style={{ width: 300 }} options={checkRules}></Select> : <InputNumber style={{ width: 300 }} />}
            </Form.Item>
          );
        })}
      </Form>
    </Modal>
  );
  const actionPop = (open: boolean, formItems: any[]) => {
    setOpen(open);
    loadCheckRuleList();
    setFormItems(formItems);
  };

  const closePop = () => {
    setOpen(false);
  };
  return { modal, actionPop, closePop };
}
