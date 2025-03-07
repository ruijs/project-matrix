/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import { type Rock } from "@ruiapp/move-style";
import { Button } from "antd";
import { useEffect, useRef, useState } from "react";

import logo from "../../../../public/favicon.png";
import rapidApi from "~/rapidApi";
import dayjs from "dayjs";
import { renderCharacteristicQualifiedConditions } from "~/utils/inspection-utility";
import { printDOM } from "../page-print/print";
import { renderMaterial } from "../material-label-renderer/MaterialLabelRenderer";
import { filter, flatten, get, isNil, map, sortBy, uniq } from "lodash";
import { MomInspectionMeasurement, MomInspectionSheet } from "~/_definitions/meta/entity-types";

interface MeasurementRecord {
  sampleCode: string;
  measurementValue: any;
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
          const measurementValue = measurement.qualitativeValue || measurement.quantitativeValue || "";
          const sampleCode = measurement.sampleCode;
          const round = measurement.round || "-";

          if (!stats[name]) {
            stats[name] = {
              appearances: 0,
              measurementRecords: [],
            };
          }

          stats[name].appearances++;
          stats[name].measurementRecords.push({ sampleCode, measurementValue, round });
        });
      });

      return stats;
    };

    function displayMeasurementValuesOfCharactor(measurementRecordsOfCharactor: MeasurementRecord[], sampleCode: string) {
      const measurementRecordsOfSample = sortBy(filter(measurementRecordsOfCharactor, { sampleCode }), (item) => item.round);
      return map(
        filter(measurementRecordsOfSample, (item) => !!item.measurementValue),
        (item) => `${item.measurementValue}`,
      ).join(" / ");
    }

    const printContent = (inspectionSheet: Partial<MomInspectionSheet>) => {
      const title = inspectionSheet?.material?.category?.name?.includes("原材料") ? "进 料 检 测 报 告" : "成 品 检 测 报 告";
      const result = inspectionSheet?.result === "unqualified" ? false : true;
      const samples = inspectionSheet?.samples;
      const measurementRecordsOfCharactors = countCharacteristics(samples);

      const supplierName = inspectionSheet.inventoryOperation?.application?.supplier?.name || "";

      const allMeasurementRecords = flatten(map(Object.values(measurementRecordsOfCharactors), (item) => item.measurementRecords));

      const sampleCodes = uniq(map(allMeasurementRecords, (item) => item.sampleCode)).sort();
      const sampleCounts = sampleCodes.length;

      const formateMeasurements = (get(inspectionSheet, "samples[0].measurements") || [])
        .filter((item: Partial<MomInspectionMeasurement>) => !isNil(item.characteristic))
        .map((item: Partial<MomInspectionMeasurement>) => {
          const { characteristic } = item;
          return {
            name: characteristic?.name,
            method: characteristic?.method?.name,
            unit: "",
            qualifiedConditions: renderCharacteristicQualifiedConditions(item?.characteristic), //指标
          };
        });

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
                物料名称：{renderMaterial(inspectionSheet?.material) || "-"}
              </td>
              <td colSpan={2} width="50%">
                批号 {inspectionSheet?.lotNum || "-"}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>包装规格：</td>
              <td colSpan={2}>供应商：{supplierName}</td>
            </tr>
            <tr>
              <td colSpan={2}>
                抽样数/供货数量：{inspectionSheet?.sampleCount || "-"}/{inspectionSheet?.acceptQuantity || "-"}
              </td>
              <td colSpan={2}>进料日期：{inspectionSheet?.createdAt ? dayjs(inspectionSheet?.createdAt).format("YYYY-MM-DD") : "-"}</td>
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
                        <td>{item.qualifiedConditions}</td>
                        <td>{sampleCounts}</td>
                        <td>
                          {sampleCodes
                            .map((sampleCode) => {
                              return displayMeasurementValuesOfCharactor(item.measurementRecords, sampleCode);
                            })
                            .filter((item) => !!item)
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
              <td colSpan={2}>异常描述：{inspectionSheet?.remark || "-"}</td>
            </tr>
            <tr>
              <td colSpan={1}>检测员:&nbsp;{inspectionSheet?.sender?.name || "-"}</td>
              <td colSpan={1}>审核员:&nbsp;{inspectionSheet?.reviewer?.name || "-"}</td>
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
          "rule",
          "sender",
          "remark",
          "inspector",
          "reviewer",
          "createdAt",
          "round",
        ],
        relations: {
          inventoryOperation: {
            relations: {
              application: {
                relations: {
                  supplier: true,
                },
              },
            },
          },
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
        properties: ["id", "code", "measurements", "round"],
        relations: {
          sheet: true,
          measurements: {
            relations: {
              characteristic: true,
            },
          },
        },
        pagination: {
          limit: 1000,
          offset: 0,
        },
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
