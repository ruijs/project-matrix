/* eslint-disable no-empty */
/* eslint-disable array-callback-return */
import { type Rock } from "@ruiapp/move-style";
import type { TableProps } from "antd";
import { Alert, Button, Form, Input, InputNumber, message, Modal, Select, Space, Spin, Table, Tag } from "antd";
import { useDebounceFn, useSetState } from "ahooks";
import { v4 as uuidv4 } from "uuid";
import rapidApi from "~/rapidApi";
import { find, get, groupBy, map, orderBy, split, uniqBy } from "lodash";
import rapidAppDefinition from "~/rapidAppDefinition";
import { useEffect, useState } from "react";
import { isCharacterMeasurementValueQualified } from "~/utils/calculate";
import { renderCharacteristicQualifiedConditions } from "~/utils/inspection-utility";

export default {
  $type: "inspectionMeasurement",

  slots: {},

  propertyPanels: [],

  Renderer(context, props, state) {
    const Info = context?.scope.stores.detail.data?.list[0];

    const [form] = Form.useForm();
    const [unSkippableArr, setUnSkippableArr] = useState<any>([]);
    const [unQualifiedArr, setUnQualifiedArr] = useState<any>([]);
    const [selected, setSelected] = useState<any>([]);
    const [validateOpen, setValidateOpen] = useState<boolean>(false);
    const [resultState, setResultState] = useState<boolean>(false);

    const { loadInpsectionMeasurement, loading, inspection, setState } = useInspectionMeasurement({
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

    const batchupdateInspectionMeasurement = (inspection: any, id: string) => {
      const currentData = inspection.find((item: any) => item.round === Info?.round)?.data || [];
      const res = currentData
        ?.map((item: any) => {
          return {
            ...item,
            items: item.items
              ?.filter((i: any) => i.id === id)
              .map((it: any) => {
                return {
                  id: it.measurementsId,
                  round: item.round,
                  isQualified: isCharacterMeasurementValueQualified(it, it.measuredValue),
                  qualitativeValue: it.kind === "qualitative" ? it.measuredValue : "",
                  quantitativeValue: it.kind === "quantitative" ? it.measuredValue : "",
                };
              })
              .filter((i: any) => i.qualitativeValue !== "" || i.quantitativeValue !== ""),
          };
        })
        .map((item: any) => item.items)
        .flat(Infinity);
      try {
        res.map((item: any) => {
          update(item);
        });
      } finally {
      }
    };

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
        title: "检测条件",
        dataIndex: "envConditions",
        width: 180,
      },
      {
        title: "合格条件",
        dataIndex: "norminal",
        width: 180,
        render: (_, r) => {
          return renderCharacteristicQualifiedConditions(r) || "-";
        },
      },
      {
        title: "实测值",
        dataIndex: "measuredValue",
        render: (_, r, idx) => {
          const onRecordChange = (v: any) => {
            const changedInspection = inspection?.map((it) => {
              return {
                ...it,
                data: it.data?.map((item: any) => {
                  return {
                    ...item,
                    items: item.items.map((i: any) => {
                      if (r.isfirst) {
                        if (r.id === i.id) {
                          return {
                            ...i,
                            measuredValue: v,
                            qualitativeValue: r.kind === "qualitative" ? v : "",
                            quantitativeValue: r.kind === "quantitative" ? v : "",
                          };
                        } else {
                          return i;
                        }
                      } else if (i.uuid === r.uuid) {
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
                }),
              };
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
                  onBlur={(value) => {
                    const v = value.target.value;
                    if (r.isfirst) {
                      batchupdateInspectionMeasurement(inspection, r.id);
                    } else if (Info.round === r.round) {
                      update({
                        id: r.measurementsId,
                        round: r.round,
                        isQualified: isCharacterMeasurementValueQualified(r, v),
                        qualitativeValue: r.kind === "qualitative" ? v : "",
                        quantitativeValue: r.kind === "quantitative" ? v : "",
                      });
                    }
                  }}
                  onChange={(v) => {
                    onRecordChange(v);
                  }}
                />
              );
            case "qualitative":
              const qualitativeDetermineType = r.qualitativeDetermineType;
              if (!qualitativeDetermineType) {
                return (
                  <Input
                    disabled={r.locked}
                    style={{ width: "100%", maxWidth: 260 }}
                    value={r.measuredValue}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (r.isfirst) {
                        batchupdateInspectionMeasurement(inspection, r.id);
                      } else if (Info.round === r.round) {
                        update({
                          id: r.measurementsId,
                          round: r.round,
                          isQualified: isCharacterMeasurementValueQualified(r, v),
                          qualitativeValue: r.kind === "qualitative" ? v : "",
                          quantitativeValue: r.kind === "quantitative" ? v : "",
                        });
                      }
                    }}
                    onChange={(e) => {
                      onRecordChange(e.target.value);
                    }}
                  />
                );
              }
              const dictionary = find(rapidAppDefinition.dataDictionaries, (d) => d.code === "QualitativeInspectionDetermineType");
              const item = find(get(dictionary, "entries"), (entry) => entry.value === r?.qualitativeDetermineType);
              const options = map(split(get(item, "name"), "/"), (v) => ({ label: v, value: v }));
              return (
                <Select
                  options={options}
                  disabled={r.locked}
                  placeholder="请选择"
                  style={{ width: "100%", maxWidth: 260 }}
                  value={r.measuredValue}
                  onBlur={(value) => {
                    const v = value;
                    if (r.isfirst) {
                      batchupdateInspectionMeasurement(inspection, r.id);
                    } else if (Info.round === r.round) {
                      update({
                        id: r.measurementsId,
                        round: r.round,
                        isQualified: isCharacterMeasurementValueQualified(r, v),
                        qualitativeValue: r.kind === "qualitative" ? v : "",
                        quantitativeValue: r.kind === "quantitative" ? v : "",
                      });
                    }
                  }}
                  onChange={(v) => {
                    onRecordChange(v);
                  }}
                />
              );
          }
        },
      },
      {
        title: "备注",
        dataIndex: "remark",
        width: 200,
      },
      {
        title: "判定",
        dataIndex: "result",
        width: 300,
        render: (_, r) => {
          if (r.measuredValue || r.measuredValue == 0) {
            const isOk = isCharacterMeasurementValueQualified(r, r.measuredValue);
            if (isOk == null) {
              return;
            }
            return isOk ? <Tag color="green">合格</Tag> : <Tag color="red">不合格</Tag>;
          } else {
            return "-";
          }
        },
      },
    ];

    const checkCofigInit = (Info: any) => {
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
        return actionPop(true, formItems);
      }
    };

    useEffect(() => {
      if (Info) {
        setResultState(Info.result === "qualified");
        if (Info?.rule?.id && Info?.sampleCount) {
          loadInpsectionMeasurement();
        } else {
          checkCofigInit(Info);
        }
      }
    }, [Info]);

    const formatTableData = (arr: any) => {
      const result = arr?.map((item: any) => {
        const v = item.items[0]?.kind === "quantitative" ? item.items[0]?.quantitativeValue : item.items[0]?.qualitativeValue;
        return {
          code: item.code,
          ...item.items[0],
          isfirst: item?.isfirst,
          round: item.round,
          isQualified: isCharacterMeasurementValueQualified(item.items[0], v),
          items: item.items
            .map((it: any) => {
              const v = it?.kind === "quantitative" ? it?.quantitativeValue : it?.qualitativeValue;
              return {
                parentCode: item?.code,
                isfirst: item?.isfirst,
                round: item?.round,
                isQualified: isCharacterMeasurementValueQualified(it, v),
                ...it,
              };
            })
            .slice(1, item?.items?.lenght),
        };
      });

      return orderBy(result, "code");
    };

    const isEmpty = (params: any) => {
      if (params === undefined || params === null || params === "") return true;
      return false;
    };

    const validateMeasurment = async (sheetId: string, arr: any, onSucess?: () => void) => {
      const res = arr
        .map((item: any) => {
          const unSkippable = item.items.filter((it: any) => !it.skippable).filter((i: any) => isEmpty(!i.qualitativeValue) && isEmpty(!i.quantitativeValue));
          return {
            code: item.code,
            unSkippable: unSkippable,
          };
        })
        .filter((item: any) => item.unSkippable.length > 0);
      setUnSkippableArr(orderBy(res, "code"));
      if (res.length > 0) {
        return setValidateOpen(true);
      } else {
        const res = arr
          .map((item: any) => {
            const unQualifiedArr = item.items
              .filter((it: any) => !it.skippable)
              .filter((it: any) => !isCharacterMeasurementValueQualified(it, it.measuredValue));
            return {
              code: item.code,
              unQualifiedArr,
            };
          })
          .filter((item: any) => item.unQualifiedArr.length > 0);
        setUnQualifiedArr(orderBy(res, "code"));
        await rapidApi
          .patch(`/mom/mom_inspection_sheets/${sheetId}`, {
            state: "inspected",
            approvalState: "approving",
          })
          .then(async (res) => {
            onSucess?.();
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
              disabled={unSkippableArr.length > 0}
              onClick={() => {
                form.validateFields().then(async (res) => {
                  try {
                    await rapidApi
                      .patch(`/mom/mom_inspection_sheets/${Info?.id}`, {
                        state: "inspected",
                        approvalState: "approving",
                        treatment: "",
                      })
                      .then(async (res) => {
                        history.go(0);
                      });
                  } catch {
                    setValidateOpen(false);
                  } finally {
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
        {unSkippableArr.length > 0 ? (
          <>
            <Alert style={{ marginBottom: 10 }} message="检测到当前当前检验单，有以下检验不可跳过。请完成检验！明细如下：" />
            <div style={{ display: "flex", justifyContent: "flex-start", alignContent: "center" }}>
              {unSkippableArr.map((item: any, index: number) => {
                return (
                  <div key={index} style={{ marginBottom: 5, marginRight: 5 }}>
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
        ) : !resultState ? (
          <>
            <Alert style={{ marginBottom: 10 }} message="检测到当前当前检验，有必须合格检验项。请选择处理结果：" />
            <div style={{ display: "flex", justifyContent: "flex-start", alignContent: "center" }}>
              {unQualifiedArr.map((item: any, index: number) => {
                return (
                  <div key={index} style={{ marginBottom: 5, marginRight: 5 }}>
                    <span>样本号：</span>
                    <span style={{ color: "red" }}>{item.code}</span>
                    {item?.unQualifiedArr?.map((it: any, index: number) => {
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
        ) : (
          <></>
        )}
      </Modal>
    );

    const checkRecord = (arr: any) => {
      const items = arr.map((item: any) => item?.items).flat();
      const res = items.every((it: any) => it?.locked);
      return res;
    };

    return (
      <div className="pm_inspection-input-sectioN">
        <Spin spinning={loading || false}>
          {inspection &&
            inspection.map((item: any, index) => {
              return (
                <div key={index}>
                  <div className="inspection_measurement--title">第{item.round}轮次检验:</div>
                  <div key={index}>
                    {item.round === Info?.round && (
                      <div className="pm_inspection-measurement--footer">
                        <Space>
                          <Button
                            type="primary"
                            disabled={!(Info?.state !== "inspected") || checkRecord(item.data)}
                            onClick={() => {
                              validateMeasurment(Info?.id, item.data, () => {
                                history.go(0);
                              });
                            }}
                          >
                            提交检验记录
                          </Button>
                          <Button
                            type="primary"
                            disabled={Info.state === "pending"}
                            onClick={() => {
                              let res: any[] = [];
                              if (inspection.length !== Info?.round) {
                                setState({
                                  inspection: inspection.pop(),
                                });
                              }
                              const uuidItem = selected.map((i: any) => i.uuid);
                              item.data.map((it: any) => {
                                const filterItem = it.items.filter((t: any) => uuidItem.includes(t.uuid));
                                if (filterItem.length > 0) {
                                  res.push({
                                    code: it.code,
                                    sheetId: it.sheetId,
                                    round: it.round + 1,
                                    items: filterItem.map((t: any) => {
                                      return {
                                        ...t,
                                        locked: false,
                                        olduuid: t.uuid,
                                        uuid: uuidv4(),
                                      };
                                    }),
                                  });
                                }
                              });
                              setState({
                                inspection: inspection.concat([
                                  {
                                    round: Info?.round + 1,
                                    data: res,
                                  },
                                ]),
                              });
                            }}
                          >
                            复检
                          </Button>
                        </Space>
                      </div>
                    )}
                    {item.round === Info?.round + 1 && (
                      <div className="pm_inspection-measurement--footer">
                        <Space>
                          <Button
                            type="primary"
                            disabled={Info.state === "inspected" && selected.length === 0}
                            onClick={async () => {
                              const res = inspection.filter((i) => i.round === Info.round + 1);
                              validateMeasurment(Info?.id, item.data, () => {
                                submitInspectionMeasurement(res, true);
                              });
                            }}
                          >
                            提交复检记录
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
                        onSelect: (record, select, selectedRows: any) => {
                          if (select) {
                            const res = uniqBy([...selected, ...selectedRows], "uuid");
                            setSelected(res);
                          } else {
                            const res = selected.filter((item: any) => item.uuid !== record?.uuid);
                            setSelected(res);
                          }
                        },
                        getCheckboxProps: (record) => ({
                          disabled: record.round === Info.round ? record?.isQualified : record?.locked,
                        }),
                      }}
                      expandable={{
                        expandedRowRender: (record) => (
                          <Table
                            scroll={{ x: 900 }}
                            rowKey={(record, index) => record?.uuid || index}
                            columns={tableColumns}
                            rowSelection={{
                              type: "checkbox",
                              onSelect: (record, select, selectedRows: any) => {
                                if (select) {
                                  const res = uniqBy([...selected, ...selectedRows], "uuid");
                                  setSelected(res);
                                } else {
                                  const res = selected.filter((i: any) => i.uuid !== record?.uuid);
                                  setSelected(res);
                                }
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
                      dataSource={formatTableData([...item.data]) || []}
                      pagination={false}
                      scroll={{ x: 900 }}
                    />
                  </div>
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

function useInspectionMeasurement(props: { ruleId: string; round: number; sheetId: string; sampleCount: number }) {
  const { ruleId, sheetId, sampleCount, round } = props;
  const [state, setState] = useSetState<InpsectionData>({});
  const { submitInspectionMeasurement } = useCreateInspectionMeasurement({
    sheetId: sheetId,
    round,
    onSuccess: () => {
      history.go(0);
    },
  });

  const loadInspectionMeasurement = async () => {
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
      let sampleArr = [];
      let roundArr = [];
      for (let i = 1; i <= sampleCount; i++) {
        sampleArr.push(i);
      }
      for (let i = 1; i <= round; i++) {
        roundArr.push(i);
      }

      if (measurementIsNull) {
        const listInspectionCharactersResponse = await rapidApi.post("/mom/mom_inspection_characteristics/operations/find", {
          filters: [
            {
              field: "rule",
              operator: "eq",
              value: ruleId,
            },
          ],
          orderBy: [
            {
              field: "orderNum",
            },
            {
              field: "id",
            },
          ],
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
            "envConditions",
          ],
        });

        const inspectionCharacters = listInspectionCharactersResponse.data.list;

        const formateArr = sampleArr.map((item: any) => {
          return {
            code: item,
            sheetId: sheetId,
            round: item.round,
            items: inspectionCharacters.map((i: any) => {
              return {
                ...i,
                uuid: uuidv4(),
              };
            }),
          };
        });

        submitInspectionMeasurement(
          [
            {
              round,
              data: formateArr ? formateArr : [],
            },
          ],
          false,
        );
      } else {
        const res = groupBy(measurements, "round");

        const result = roundArr.map((item) => {
          return {
            round: item,
            data: res[item],
          };
        });

        const formateArr = result.map((item: any) => {
          return {
            round: item.round,
            data:
              item?.data?.map((it: any, index: any) => {
                return {
                  code: it.code,
                  id: it.id,
                  sheetId: sheetId,
                  isfirst: index === 0 ? true : false,
                  round: it.round,
                  items: orderBy(
                    it.measurements.map((i: any) => {
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
                    "orderNum",
                  ),
                };
              }) || [],
          };
        });

        setState({
          inspection: formateArr ? formateArr : [],
        });
      }
    } finally {
      setState({ loading: false });
    }
  };

  return { loadInpsectionMeasurement: loadInspectionMeasurement, ...state, setState };
}

function useCreateInspectionMeasurement(options: { sheetId: string; round: number; onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const submitInspectionMeasurement = async (inspection: any, isReCheck?: boolean) => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    const params = {
      entities: inspection
        .map((it: any) => {
          const res = it.data.map((item: any) => {
            return {
              code: item.code,
              sheet_id: options.sheetId,
              round: isReCheck ? options?.round + 1 : 1,
              measurements: item.items.map((it: any) => {
                return {
                  isQualified: isCharacterMeasurementValueQualified(it, it.measuredValue),
                  sampleCode: item.code,
                  locked: isReCheck ? true : false,
                  quantitativeValue: it.quantitativeValue || null,
                  qualitativeValue: it.qualitativeValue || null,
                  characteristic: {
                    id: item.items.find((i: any) => i.uuid === it.uuid)?.id,
                  },
                };
              }),
            };
          });
          return res;
        })
        .flat(),
    };

    if (isReCheck) {
      const params = {
        state: "inspected",
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

  const update = async (inspectionItem: any, retryCount: number = 3) => {
    if (submitting) {
      return;
    }
    setSubmitting(true);

    const params = {
      isQualified: inspectionItem.isQualified,
      round: inspectionItem.round,
      quantitativeValue: inspectionItem.quantitativeValue
        ? inspectionItem.quantitativeValue
        : inspectionItem.quantitativeValue === 0
        ? inspectionItem.quantitativeValue
        : null,
      qualitativeValue: inspectionItem.qualitativeValue
        ? inspectionItem.qualitativeValue
        : inspectionItem.qualitativeValue === 0
        ? inspectionItem.qualitativeValue
        : null,
    };

    try {
      const res = await rapidApi.patch(`/mom/mom_inspection_measurements/${inspectionItem.id}`, params);
      if (res.status >= 200 && res.status < 400) {
        options.onSuccess?.();
      }
    } catch (e) {
      if (retryCount > 0) {
        await update(inspectionItem, retryCount - 1);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, update };
}

function useSetConfigCheckRule(options: { sheetId: string }) {
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
  const { checkRules, loadCheckRuleList, setConfigCheckRule } = useSetConfigCheckRule({ sheetId: options?.sheetId });

  const modal = (
    <Modal
      title="温馨提示"
      open={open}
      destroyOnClose
      closable={false}
      cancelText="取消"
      okText="提交"
      onCancel={() => {
        setOpen(false);
      }}
      onOk={() => {
        form.validateFields().then((res) => {
          onOk(res);
          setConfigCheckRule(res);
          history.go(0);
        });
      }}
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
