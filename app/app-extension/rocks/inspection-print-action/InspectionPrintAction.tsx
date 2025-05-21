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
import { filter, map, sortBy, uniq } from "lodash";
import { MomInspectionCharacteristic, MomInspectionMeasurement, MomInspectionSheet, MomInventoryApplicationItem } from "~/_definitions/meta/entity-types";
import { renderPrintableCheckbox } from "~/utils/common-renderers";

interface MeasurementRecord {
  sampleCode: string;
  measurementValue: any;
  round: number;
}

interface MeasurementRecordsOfCharacter {
  name?: string;
  envConditions?: string;
  method?: string;
  unitName?: string;
  qualifiedConditions?: string;
  measurementRecords: MeasurementRecord[];
}

export default {
  $type: "inspectionPrintAction",

  slots: {},

  propertyPanels: [],

  Renderer(context, props, state) {
    const ref = useRef<HTMLDivElement>(null);
    const { loadInspectionSheet, inspectionSheet, inventoryApplicationItem } = useInspectionSheet();
    const [shouldPrint, setShouldPrint] = useState(false);

    const handlePrintClick = async () => {
      setShouldPrint(true);

      if (!inspectionSheet) {
        loadInspectionSheet(props?.record?.id);
      }
    };

    function groupMeasurementRecordsByCharacter(
      measurements: MomInspectionMeasurement[],
      characteristics: MomInspectionCharacteristic[],
    ): MeasurementRecordsOfCharacter[] {
      return map(characteristics, (character) => {
        const measurementRecords: MeasurementRecord[] = [];

        measurements.forEach?.((measurement) => {
          if ((measurement as any).characteristic_id !== character.id) {
            return;
          }

          const measurementValue = measurement.qualitativeValue || measurement.quantitativeValue || "";
          const sampleCode = measurement.sampleCode || "";
          const round = measurement.round || 1;

          measurementRecords.push({ sampleCode, measurementValue, round });
        });

        return {
          name: character.name,
          envConditions: character.envConditions,
          method: character.method?.name,
          unitName: character.unitName,
          qualifiedConditions: renderCharacteristicQualifiedConditions(character), //指标
          measurementRecords,
        } satisfies MeasurementRecordsOfCharacter;
      });
    }

    function displayMeasurementValuesOfCharacter(measurementRecordsOfCharacter: MeasurementRecord[], sampleCode: string) {
      const measurementRecordsOfSample = sortBy(filter(measurementRecordsOfCharacter, { sampleCode }), (item) => item.round);
      return map(
        filter(measurementRecordsOfSample, (item) => !!item.measurementValue),
        (item) => `${item.measurementValue}`,
      ).join(" / ");
    }

    const PrintContent = (inspectionSheet: Partial<MomInspectionSheet>) => {
      if (!inspectionSheet) {
        return null;
      }

      const title = inspectionSheet?.rule?.category?.name?.includes("来料检验") ? "进料检测报告" : "成品检测报告";
      const isQualified = inspectionSheet.result !== "unqualified";
      const measurements: MomInspectionMeasurement[] = (inspectionSheet.measurements as any) || [];
      const characteristics: MomInspectionCharacteristic[] = (inspectionSheet.rule?.characteristics as any) || [];
      const measurementRecordsOfCharacters = groupMeasurementRecordsByCharacter(measurements, characteristics);

      const supplierName = inspectionSheet.inventoryOperation?.application?.supplier?.name || "";

      const sampleCodes = uniq(map(measurements, (item) => item.sampleCode)).sort();
      const sampleCounts = sampleCodes.length;

      return (
        <div ref={ref} className="inspection-template-container">
          <img src={logo} width="200" />
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 25,
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              padding: "10px",
              letterSpacing: "0.5em",
            }}
          >
            {title}
          </div>
          <table className="printable-table">
            <tr>
              <td colSpan={2} width="50%">
                物料名称：{renderMaterial(inspectionSheet.material) || "-"}
              </td>
              <td colSpan={2} width="50%">
                批号：{inspectionSheet.lotNum || "-"}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>包装规格：</td>
              <td colSpan={2}>供应商：{supplierName}</td>
            </tr>
            <tr>
              <td colSpan={2}>
                抽样数/供货数量：
                {inspectionSheet.sampleCount || "-"}
                {` / `}
                {inventoryApplicationItem?.quantity ? `${inventoryApplicationItem?.quantity}${inventoryApplicationItem?.unit?.name || ""}` : "-"}
              </td>
              <td colSpan={2}>进料日期：{inspectionSheet.createdAt ? dayjs(inspectionSheet.createdAt).format("YYYY-MM-DD") : "-"}</td>
            </tr>
            <tr>
              <td colSpan={1}>非指标类检查结果</td>
              <td colSpan={1}>
                {renderPrintableCheckbox(false)} 符合品质要求
                <br />
                {renderPrintableCheckbox(false)} 不符合品质要求
              </td>
              <td colSpan={2} style={{ height: 100, verticalAlign: "top" }}>
                异常描述:
              </td>
            </tr>
            <tr>
              <td colSpan={4}>检测项目及结果（参考标准版次：08）</td>
            </tr>
            <tr>
              <td colSpan={4} style={{ padding: 0 }}>
                <table className="printable-table">
                  <tr>
                    <th style={{ width: "90px" }}>检测项目</th>
                    <th style={{ width: "100px" }}>检测条件</th>
                    <th style={{ width: "50px" }}>单位</th>
                    <th style={{ width: "70px" }}>指标</th>
                    <th style={{ width: "70px" }}>样本数量</th>
                    <th>检测结果</th>
                  </tr>
                  {measurementRecordsOfCharacters.map((measurementRecordsOfCharacter, index: number) => {
                    return (
                      <tr key={index}>
                        <td>{measurementRecordsOfCharacter.name}</td>
                        <td>{measurementRecordsOfCharacter.envConditions}</td>
                        <td style={{ textAlign: "center" }}>{measurementRecordsOfCharacter.unitName}</td>
                        <td style={{ textAlign: "center" }}>{measurementRecordsOfCharacter.qualifiedConditions}</td>
                        <td style={{ textAlign: "center" }}>{sampleCounts}</td>
                        <td>
                          {sampleCodes
                            .map((sampleCode) => {
                              return displayMeasurementValuesOfCharacter(measurementRecordsOfCharacter.measurementRecords, sampleCode);
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
                {renderPrintableCheckbox(isQualified)} 合格&nbsp;&nbsp;
                {renderPrintableCheckbox(!isQualified)} 不合格
              </td>
              <td colSpan={2}>异常描述：{inspectionSheet.remark || "-"}</td>
            </tr>
            <tr>
              <td colSpan={1}>检测员：{inspectionSheet.inspector?.name || "-"}</td>
              <td colSpan={1}>审核员：{inspectionSheet.reviewer?.name || "-"}</td>
              <td colSpan={2}>确认（不合格时）：</td>
            </tr>
          </table>
        </div>
      );
    };

    useEffect(() => {
      if (inspectionSheet && shouldPrint && ref.current) {
        printDOM(ref.current!);
        setShouldPrint(false);
      }
    }, [inspectionSheet, shouldPrint, ref.current]);

    return (
      <>
        <Button style={{ padding: 0, marginLeft: 6 }} type="link" onClick={handlePrintClick}>
          打印
        </Button>
        <div style={{ display: "none" }}>
          <div>{inspectionSheet && PrintContent(inspectionSheet)}</div>
        </div>
      </>
    );
  },
} as Rock<any>;

function useInspectionSheet(): {
  loading: boolean;
  loadInspectionSheet: any;
  inspectionSheet: MomInspectionSheet;
  inventoryApplicationItem: MomInventoryApplicationItem;
} {
  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = useState<any>({});

  const loadInspectionSheet = async (id: string) => {
    if (loading) return;

    try {
      setLoading(true);
      const listInspectionSheetsResponse = await rapidApi.post(`/mom/mom_inspection_sheets/operations/find`, {
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
          rule: {
            relations: {
              category: true,
              characteristics: {
                orderBy: [
                  {
                    field: "orderNum",
                  },
                ],
              },
            },
          },
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
            properties: ["id", "code", "name", "specification", "defaultUnit"],
          },
          measurements: true,
        },
        keepNonPropertyFields: true,
      });

      const inspectionSheet: MomInspectionSheet = listInspectionSheetsResponse.data.list[0];
      let inventoryApplicationItem: MomInventoryApplicationItem | null = null;
      const { material, lotNum } = inspectionSheet;

      if (material && lotNum) {
        const listInventoryApplicationItemsResponse = await rapidApi.post(`/mom/mom_inventory_application_items/operations/find`, {
          filters: [
            {
              field: "material_id",
              operator: "eq",
              value: material.id,
            },
            {
              field: "lotNum",
              operator: "eq",
              value: lotNum,
            },
          ],
          relations: {
            unit: true,
          },
        });
        inventoryApplicationItem = listInventoryApplicationItemsResponse.data.list[0];
      }

      setState({ inspectionSheet, inventoryApplicationItem });
      return inspectionSheet;
    } catch (err) {
      console.error(err);
    }
  };

  return { loading, loadInspectionSheet, inspectionSheet: state.inspectionSheet, inventoryApplicationItem: state.inventoryApplicationItem };
}
