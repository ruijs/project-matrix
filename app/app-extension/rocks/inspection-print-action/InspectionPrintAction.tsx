/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import { type Rock } from "@ruiapp/move-style";
import { Button } from "antd";
import { useEffect, useRef, useState } from "react";

import logo from "../../../../public/favicon.png";
import rapidApi from "~/rapidApi";
import dayjs from "dayjs";
import { fmtCharacteristicNorminal } from "~/utils/fmt";
import { printDOM } from "../page-print/print";
import { renderMaterial } from "../material-label-renderer/MaterialLabelRenderer";
import { filter, flatten, map, sortBy, uniq } from "lodash";

interface IInspectionsSheet {
  id: string;
  code: string;
  state: string;
  approvalState: string;
  result: string;
  material: {
    category: {
      id: string;
      code: string;
      name: string;
    };
    code: string;
    id: number;
    name: string;
  };
  customer: string;
  lotNum: string;
  sampleCount: number;
  inventoryOperation: string;
  rule: string;
  acceptQuantity: string;
  sender: {
    name: string;
  };
  reviewer: {
    name: string;
  };
  samples: any[];
  createdAt: string;
  remark: string;
}

interface MeasurementRecord {
  sampleCode: string;
  value: any;
  round: number;
}

interface MeasurementRecordsOfCharactor {
  appearances: number;
  measurementRecords: MeasurementRecord[];
}

export default {
  $type: "inspectionPrintAction",

  slots: {},

  propertyPanels: [],

  Renderer(context, props, state) {
    const ref = useRef<HTMLDivElement>(null);
    const { loadInspectionSheet, inspectionSheet } = useInspectionSheet();
    const handleOnClick = async () => {
      if (inspectionSheet) {
        printDOM(ref.current);
      } else {
        loadInspectionSheet(props?.record?.id).then((res) => {
          if (res) {
            printDOM(ref.current!);
          }
        });
      }
    };

    const countCharacteristics = (data: any) => {
      const stats: Record<string, MeasurementRecordsOfCharactor> = {};

      data?.forEach((item: any) => {
        item.measurements?.forEach?.((measurement: any) => {
          if (!measurement.characteristic) {
            return;
          }

          const name = measurement.characteristic?.name;
          const value = measurement.qualitativeValue || measurement.quantitativeValue || "-";
          const sampleCode = measurement.sampleCode;
          const round = measurement.round || "-";

          if (!stats[name]) {
            stats[name] = {
              appearances: 0,
              measurementRecords: [],
            };
          }

          stats[name].appearances++;
          stats[name].measurementRecords.push({ sampleCode, value, round });
        });
      });

      return stats;
    };

    function displayMeasurementValuesOfCharactor(measurementRecordsOfCharactor: MeasurementRecord[], sampleCode: string) {
      const measurementRecordsOfSample = sortBy(filter(measurementRecordsOfCharactor, { sampleCode }), (item) => item.round);
      return map(measurementRecordsOfSample, (item) => `${item.value}`).join("/");
    }

    const printContent = (res: IInspectionsSheet) => {
      const title = res?.material?.category?.name?.includes("原材料") ? "进 料 检 测 报 告" : "成 品 检 测 报 告";
      const result = res?.result === "unqualified" ? false : true;
      const samples = res?.samples;
      const measurementRecordsOfCharactors = countCharacteristics(samples);

      const allMeasurementRecords = flatten(map(Object.values(measurementRecordsOfCharactors), (item) => item.measurementRecords));

      const sampleCodes = uniq(map(allMeasurementRecords, (item) => item.sampleCode)).sort();

      const formateMeasurements =
        res?.samples[0]?.measurements
          ?.filter((item: any) => item?.characteristic != null)
          ?.map((item: any) => {
            return {
              name: item?.characteristic?.name,
              method: item?.characteristic?.method?.name,
              unit: "",
              norminal: fmtCharacteristicNorminal(item?.characteristic), //指标
            };
          }) || [];

      const samplesArray = map(formateMeasurements, (item: any) => {
        const measurementRecordsOfCharactor = measurementRecordsOfCharactors[item.name];
        const appearances = measurementRecordsOfCharactor?.appearances || "-";
        return {
          ...item,
          appearances,
          measurementRecords: measurementRecordsOfCharactor.measurementRecords,
        };
      });

      return (
        <div ref={ref} className="inspection-template-container">
          <img src={logo} style={{ width: 200, height: 75 }} />
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 25, borderTop: "none", borderLeft: "none", borderRight: "none", padding: "10px" }}>
            {title}
          </div>
          <table className="printable-table">
            <tr>
              <td colSpan={2} width="50%">
                物料名称：{renderMaterial(res?.material) || "-"}
              </td>
              <td colSpan={2} width="50%">
                批号 {res?.lotNum || "-"}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>包装规格：</td>
              <td colSpan={2}>供应商：</td>
            </tr>
            <tr>
              <td colSpan={2}>
                抽样数/供货数量：{res?.sampleCount || "-"}/{res?.acceptQuantity || "-"}
              </td>
              <td colSpan={2}>进料日期：{res?.createdAt ? dayjs(res?.createdAt).format("YYYY-MM-DD") : "-"}</td>
            </tr>
            <tr>
              <td rowSpan={2} colSpan={1}>
                非指标类检查结果
              </td>
              <td rowSpan={2} colSpan={1}>
                <input type="checkbox" name="qualityRequirement[]" value="符合品质要求" /> 符合品质要求
                <br />
                <input type="checkbox" name="qualityRequirement[]" value="不符合品质要求" /> 不符合品质要求
              </td>
              <td colSpan={2}>异常描述:</td>
            </tr>
            <tr>
              <td colSpan={2}>
                <div style={{ height: 50, width: "100%" }} />
              </td>
            </tr>
            <tr>
              <td colSpan={4}>检测项目及结果（参考标准版次：08）</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ padding: 0 }}>
                <table className="printable-table" style={{ border: 0 }}>
                  <tr>
                    <td style={{ width: "90px" }}>检测项目</td>
                    <td style={{ width: "100px" }}>检查方法</td>
                    <td style={{ width: "90px" }}>单位</td>
                    <td style={{ width: "70px" }}>指标</td>
                    <td style={{ width: "90px" }}>样本数量</td>
                    <td>检测结果</td>
                  </tr>
                  {samplesArray.map((item: any, index: number) => {
                    return (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.method}</td>
                        <td>{item.unit}</td>
                        <td>{item.norminal}</td>
                        <td>{item.appearances}</td>
                        <td>
                          {sampleCodes
                            .map((sampleCode) => {
                              return displayMeasurementValuesOfCharactor(item.measurementRecords, sampleCode);
                            })
                            .join("、")}
                        </td>
                      </tr>
                    );
                  })}
                </table>
              </td>
            </tr>

            <tr>
              <td colSpan={2}>
                判定：&nbsp;
                <input type="checkbox" name="judgment" value="合格" checked={result} /> 合格 &nbsp;
                <input type="checkbox" name="judgment" value="不合格" checked={!result} /> 不合格
              </td>
              <td colSpan={2}>异常描述：{res?.remark || "-"}</td>
            </tr>
            <tr>
              <td colSpan={1}>检测员:&nbsp;{res?.sender?.name || "-"}</td>
              <td colSpan={1}>审核员:&nbsp;{res?.reviewer?.name || "-"}</td>
              <td colSpan={2}>确认（不合格时）:&nbsp;</td>
            </tr>
          </table>
        </div>
      );
    };

    useEffect(() => {
      if (inspectionSheet && ref.current) {
        handleOnClick();
      }
    }, [inspectionSheet, ref.current]);

    return (
      <>
        <Button style={{ padding: 0, marginLeft: 6 }} type="link" onClick={handleOnClick}>
          打印
        </Button>
        <div style={{ display: "none" }}>
          <div>{inspectionSheet && printContent(inspectionSheet)}</div>
        </div>
      </>
    );
  },
} as Rock<any>;

const useInspectionSheet = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [inspectionSheet, setInspectionSheet] = useState<any>();

  const loadInspectionSheet = async (id: string) => {
    if (loading) return;

    try {
      setLoading(true);
      const res = await rapidApi.post(`/mom/mom_inspection_sheets/operations/find`, {
        filters: [
          {
            field: "id",
            operator: "eq",
            value: id,
          },
        ],
        properties: [
          "id",
          "code",
          "state",
          "approvalState",
          "acceptQuantity",
          "result",
          "material",
          "customer",
          "lotNum",
          "sampleCount",
          "inventoryOperation",
          "rule",
          "sender",
          "remark",
          "inspector",
          "reviewer",
          "createdAt",
          "round",
        ],
        relations: {
          material: {
            properties: ["id", "code", "name", "specification", "category", "defaultUnit"],
            relations: {
              category: {
                properties: ["id", "code", "name", "printTemplate"],
              },
            },
          },
        },
      });

      const samples = await rapidApi.post(`/mom/mom_inspection_sheet_samples/operations/find`, {
        filters: [
          {
            field: "sheet",
            operator: "eq",
            value: id,
          },
        ],
        relations: {
          measurements: {
            relations: {
              characteristic: {
                properties: [
                  "id",
                  "name",
                  "skippable",
                  "mustPass",
                  "method",
                  "instrumentCategory",
                  "instrument",
                  "kind",
                  "norminal",
                  "createdAt",
                  "determineType",
                  "qualitativeDetermineType",
                  "upperTol",
                  "lowerTol",
                  "upperLimit",
                  "lowerLimit",
                ],
              },
            },
            properties: ["id", "isQualified", "qualitativeValue", "quantitativeValue", "sampleCode", "instrument", "characteristic", "locked", "round"],
          },
        },
        pagination: {
          limit: 1000,
          offset: 0,
        },
        properties: ["id", "code", "sheet", "measurements", "round"],
      });

      const formateData = {
        ...res.data.list[0],
        samples: samples.data.list,
      };
      setInspectionSheet(formateData);

      return formateData;
    } catch (e) {}
  };

  return { loading, inspectionSheet, loadInspectionSheet };
};
