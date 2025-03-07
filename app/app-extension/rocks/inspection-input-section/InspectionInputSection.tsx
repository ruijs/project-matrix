import { type Rock } from "@ruiapp/move-style";
import type { TableProps } from "antd";
import { Button, Descriptions, InputNumber, message, Select, Space, Spin, Table, Tag } from "antd";
import { useDebounceFn, useSetState } from "ahooks";
import ScannerSection from "./ScannerSection";
import rapidApi from "~/rapidApi";
import { find, get, map, split } from "lodash";
import { decimalSum } from "~/utils/decimal";
import rapidAppDefinition from "~/rapidAppDefinition";
import { useState } from "react";
import dayjs from "dayjs";
import { renderCharacteristicQualifiedConditions } from "~/utils/inspection-utility";
import { isCharacterMeasurementValueQualified } from "~/utils/calculate";

interface ICurrentState {
  inspectionScanInfo?: Record<string, any>;
}

export default {
  $type: "inspectionInputSection",

  slots: {},

  propertyPanels: [],

  Renderer(context, props, state) {
    const [currentState, setCurrentState] = useSetState<ICurrentState>({});

    const { loadInspectionData, loading, inspection, setState } = useInpsectionData();
    const { submitting, submitInspectionRecords } = useCreateInspectionRecords({
      scanInfo: currentState.inspectionScanInfo!,
      inspection: inspection!,
      onSuccess() {
        setCurrentState({ inspectionScanInfo: undefined });
      },
    });

    const tableColumns: TableProps<any>["columns"] = [
      {
        title: "序号",
        dataIndex: "index",
        width: 60,
        render: (_, r, idx) => idx + 1,
      },
      {
        title: "检验项",
        dataIndex: "name",
        width: 120,
      },
      {
        title: "检验仪器",
        dataIndex: "instrument",
        width: 120,
        render: (_) => {
          return get(_, "code");
        },
      },
      {
        title: "标准值",
        dataIndex: "norminal",
        width: 120,
        render: (_, r) => {
          return renderCharacteristicQualifiedConditions(r);
        },
      },
      {
        title: "实测值",
        dataIndex: "measuredValue",
        width: 180,
        render: (_, r, idx) => {
          const onRecordChange = (v: any) => {
            const changedInspection = {
              ...inspection,
              items: inspection?.items?.map((item: any, index: number) => (index === idx ? { ...item, measuredValue: v } : item)),
            };
            setState({
              inspection: changedInspection,
            });
          };

          switch (r.kind) {
            case "quantitative":
              return (
                <InputNumber
                  placeholder="请输入"
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
        width: 80,
        render: (_, r) => {
          const isOk = isCharacterMeasurementValueQualified(r, r.measuredValue);

          if (isOk == null) {
            return;
          }

          return isOk ? <Tag color="green">合格</Tag> : <Tag color="red">不合格</Tag>;
        },
      },
    ];

    if (!currentState.inspectionScanInfo) {
      return (
        <ScannerSection
          onScan={(info) => {
            setCurrentState({ inspectionScanInfo: info });
            loadInspectionData(info.sn);
          }}
        />
      );
    }

    return (
      <div className="pm_inspection-input-section">
        <Spin spinning={loading || false}>
          <Descriptions column={3}>
            <Descriptions.Item label="物料">{get(inspection, "material.name")}</Descriptions.Item>
            <Descriptions.Item label="型号">{get(inspection, "material.specification")}</Descriptions.Item>
            <Descriptions.Item label="批次">{get(inspection, "lotNum")}</Descriptions.Item>
            <Descriptions.Item label="检验单号">{get(inspection, "code")}</Descriptions.Item>
            <Descriptions.Item label="样本序号">{get(currentState.inspectionScanInfo, "sample")}</Descriptions.Item>
          </Descriptions>
          <Table size="middle" columns={tableColumns} dataSource={inspection?.items || []} pagination={false} scroll={{ x: 700 }} />
          <div className="pm_inspection-input-section--footer">
            <Space size={24}>
              <Button
                disabled={submitting}
                onClick={() => {
                  setCurrentState({
                    inspectionScanInfo: undefined,
                  });
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                loading={submitting}
                onClick={() => {
                  submitInspectionRecords();
                }}
              >
                提交
              </Button>
            </Space>
          </div>
        </Spin>
      </div>
    );
  },
} as Rock<any>;

interface InpsectionData {
  loading?: boolean;
  inspection?: Record<string, any>;
}

function useInpsectionData() {
  const [state, setState] = useSetState<InpsectionData>({});

  const loadInspectionData = async (code: string) => {
    if (state.loading) {
      return;
    }

    setState({ loading: true });
    try {
      const inspectionData = await rapidApi.post("/mom/mom_inspection_sheets/operations/find", {
        filters: [
          {
            field: "code",
            operator: "eq",
            value: code,
          },
        ],
        pagination: { limit: 1, offset: 0 },
        properties: [
          "id",
          "state",
          "approvalState",
          "code",
          "material",
          "lotNum",
          "inventoryOperation",
          "result",
          "sender",
          "inspector",
          "reviewer",
          "createdAt",
          "rule",
        ],
      });
      const inspection = (inspectionData.data?.list || [])[0];
      const result = await rapidApi.post("/mom/mom_inspection_characteristics/operations/find", {
        filters: [
          {
            field: "rule",
            operator: "exists",
            filters: [
              {
                field: "id",
                operator: "eq",
                value: inspection.rule?.id,
              },
            ],
          },
        ],
        pagination: { limit: 100, offset: 0 },
        properties: [
          "id",
          "name",
          "skippable",
          "category",
          "method",
          "instrumentCategory",
          "instrument",
          "determineType",
          "qualitativeDetermineType",
          "kind",
          "norminal",
          "upperTol",
          "lowerTol",
          "upperLimit",
          "lowerLimit",
          "createdAt",
        ],
      });
      setState({
        inspection: {
          ...(inspection || {}),
          items: result?.data?.list || [],
        },
      });
    } finally {
      setState({ loading: false });
    }
  };

  return { loadInspectionData, ...state, setState };
}

function useCreateInspectionRecords(options: { scanInfo: Record<string, any>; inspection: Record<string, any>; onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const submitInspectionRecords = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    const measurements = (options.inspection?.items || []).map((item: any) => {
      let measureInfo: Record<string, any> = { isQualified: false };
      switch (item.kind) {
        case "quantitative":
          measureInfo.isQualified =
            item.measuredValue != null
              ? item.measuredValue >= decimalSum(item.norminal, item.lowerTol) && item.measuredValue <= decimalSum(item.norminal, item.upperTol)
              : false;
          measureInfo.quantitativeValue = item.measuredValue;
          break;
        case "qualitative":
          measureInfo.isQualified = item.measuredValue ? item.measuredValue === item.norminal : false;
          measureInfo.qualitativeValue = item.measuredValue;
          break;
      }

      return {
        characteristic: get(item, "id"),
        inspectedAt: dayjs().format(),
        instrument: get(item, "instrument.id"),
        instrumentCategory: get(item, "instrumentCategory.id"),
        ...measureInfo,
        sheet_id: get(options.inspection, "id"),
      };
    });

    await rapidApi
      .post("/mom/mom_inspection_sheet_samples", {
        code: get(options.scanInfo, "sample"),
        sheet_id: get(options.inspection, "id"),
        measurements,
      })
      .then((res) => {
        if (res.status >= 200 && res.status < 400) {
          options.onSuccess?.();
          message.success("检验录入成功");
        } else {
          message.error("检验录入失败");
        }
        setSubmitting(false);
      })
      .catch(() => {
        message.error("检验录入失败");
        setSubmitting(false);
      });
  };

  const submitFn = useDebounceFn(submitInspectionRecords, { wait: 300 });

  return { submitting, submitInspectionRecords: submitFn.run };
}
