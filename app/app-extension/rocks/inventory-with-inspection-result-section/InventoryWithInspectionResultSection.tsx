import type { Rock } from "@ruiapp/move-style";
import InventoryWithInspectionResultSectionMeta from "./InventoryWithInspectionResultSectionMeta";
import type { InventoryWithInspectionResultSectionRockConfig } from "./inventory-with-inspection-result-section-types";
import rapidApi from "~/rapidApi";
import { useRequest } from "ahooks";
import { Button, Divider, Form, Space, Spin, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/lib/table";
import { useEffect, useState } from "react";
import { filter, find, first, forEach, map, orderBy, reduce } from "lodash";
import type { MomInspectionCommonCharacteristic, MomInspectionMeasurement, MomInspectionSheet } from "~/_definitions/meta/entity-types";
import { renderMaterial } from "../material-label-renderer/MaterialLabelRenderer";
import { renderRock } from "@ruiapp/react-renderer";
import AddMaterialForm from "./AddMaterialForm";
import { isCharacterMeasurementValueQualified } from "~/utils/calculate";

type QueryResult = {
  inspectionCharNames: string[];
  inventories: InventoryType[];
};

type InventoryType = {
  rowKey: string;
  materialId: number;
  material: {
    id: number;
    code: string;
    name: string;
    specification: string;
  };
  lotNum?: string;
  warehouseId?: number;
  warehouse?: {
    id: number;
    code: string;
    name: string;
  };
  locations?: {
    id: number;
    code: string;
    name: string;
    quality: number;
  }[];
  quality?: number;
  inspectionSheet?: MomInspectionSheet;
  children?: InventoryType[];
};

export default {
  Renderer(context, props: InventoryWithInspectionResultSectionRockConfig) {
    const [materialIds, setMaterialIds] = useState<number[]>([]);

    const queryData = async () => {
      const res = await rapidApi.post("app/inventory/queryInventoryWithInspectionResult", {
        materialIds,
      });
      // await waitSeconds(1);
      return res.data;
    };
    const { data, loading, error } = useRequest<QueryResult, []>(queryData, {
      refreshDeps: [materialIds],
    });

    if (!data) {
      return null;
    }

    const onAddMaterial = (materialId: number) => {
      if (materialIds.indexOf(materialId) !== -1) {
        return;
      }

      setMaterialIds((prev) => {
        return [...prev, materialId];
      });
    };

    const measurementValueColumns: ColumnsType<InventoryType> = map(data.inspectionCharNames, (inspectionCharName) => {
      return {
        title: inspectionCharName,
        dataIndex: `inspectionChars.${inspectionCharName}`,
        key: `inspectionChars.${inspectionCharName}`,
        width: "80px",
        render: (value, record, index) => {
          let measurements: Partial<MomInspectionMeasurement>[] | undefined = filter(
            record.inspectionSheet?.measurements || [],
            (measurement: Partial<MomInspectionMeasurement>) => {
              return measurement.characteristic?.name === inspectionCharName;
            },
          );

          measurements = orderBy(measurements, ["sampleCode"]);
          const measurement = first(measurements);
          if (!measurement) {
            return null;
          }

          const inspectionChar = measurement.characteristic!;

          const measuredValue = inspectionChar.kind === "qualitative" ? measurement.qualitativeValue : measurement.quantitativeValue;
          const isOK = isCharacterMeasurementValueQualified(inspectionChar, measuredValue);
          const valueStyle: React.CSSProperties = {};
          if (isOK === false) {
            valueStyle.color = "red";
          }
          if (inspectionChar.kind === "qualitative") {
            return <span style={valueStyle}>{measuredValue}</span>;
          } else {
            return <span style={valueStyle}>{measuredValue}</span>;
          }
        },
      };
    });

    const columns: ColumnsType<InventoryType> = [
      {
        title: "批次",
        dataIndex: "lotNum",
        key: "lotNum",
        fixed: "left",
        width: "300px",
        render: (value, record, index) => {
          return record.lotNum || renderMaterial(record.material);
        },
      },
      {
        title: "仓库",
        dataIndex: ["warehouse", "name"],
        key: "warehouse",
        fixed: "left",
        width: "100px",
      },
      {
        title: "数量",
        dataIndex: "quantity",
        key: "quantity",
        fixed: "left",
        align: "right",
        width: "80px",
      },
      {
        title: "库位",
        dataIndex: "locations",
        fixed: "left",
        key: "locations",
        width: "150px",
        align: "center",
        render: (locations: InventoryType["locations"], record, index) => {
          return (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {(locations || []).map((location) => {
                return (
                  <li key={location.code} style={{ padding: "2px 0" }}>
                    <Tooltip title={`数量：${location.quality}`}>{location.code}</Tooltip>
                  </li>
                );
              })}
            </ul>
          );
        },
      },
      {
        title: "检验状态",
        dataIndex: "inspectionSheet",
        key: "inspectionSheet",
        fixed: "left",
        width: "100px",
        align: "center",
        render: (inspectionSheet: InventoryType["inspectionSheet"], record, index) => {
          if (record.children) {
            return null;
          }

          if (!inspectionSheet) {
            return <Tag>未检验</Tag>;
          }

          if (inspectionSheet.result === "uninspected") {
            return <Tag>未检验</Tag>;
          } else if (inspectionSheet.result === "inspectFree") {
            return <Tag color="green">免检</Tag>;
          } else if (inspectionSheet.result === "qualified") {
            return <Tag color="green">合格</Tag>;
          } else if (inspectionSheet.result === "unqualified") {
            return <Tag color="red">不合格</Tag>;
          }
        },
      },
      ...measurementValueColumns,
    ];

    const columnsTotalWidth = reduce(
      columns,
      (accumulatedWidth, column) => {
        return accumulatedWidth + (parseInt(column.width + "", 10) || 200);
      },
      0,
    );

    const inventoriesGroupByMaterial: InventoryType[] = [];
    forEach(data.inventories, (inventory) => {
      if (inventoriesGroupByMaterial.find((material) => material.materialId === inventory.material.id)) {
        return;
      }
      inventoriesGroupByMaterial.push({
        rowKey: `${inventory.material.id}`,
        materialId: inventory.material.id,
        material: inventory.material,
        children: [],
      });
    });

    const inventories: any[] = map(data.inventories || [], (inventory) => {
      return {
        rowKey: `${inventory.materialId}-${inventory.lotNum}`,
        materialId: inventory.materialId,
        lotNum: inventory.lotNum,
        quantity: inventory.quality,
        warehouse: inventory.warehouse,
        locations: orderBy(inventory.locations, ["code"]),
        inspectionSheet: inventory.inspectionSheet,
      };
    });

    forEach(inventoriesGroupByMaterial, (material) => {
      forEach(inventories, (inventory) => {
        if (material.materialId === inventory.materialId) {
          material.children?.push(inventory);
        }
      });
    });

    return (
      <div>
        {loading && !data && <Spin></Spin>}
        {error && <code>{error.message.toString()}</code>}
        {data && (
          <div>
            <Table
              rowKey={(record) => record.rowKey}
              loading={loading}
              size="small"
              pagination={false}
              columns={columns}
              scroll={{
                x: columnsTotalWidth,
              }}
              expandable={{ defaultExpandAllRows: true }}
              dataSource={inventoriesGroupByMaterial}
            />
          </div>
        )}
        <div style={{ padding: "10px 0" }}>
          <AddMaterialForm context={context} onAddMaterial={onAddMaterial} />
        </div>
      </div>
    );
  },

  ...InventoryWithInspectionResultSectionMeta,
} as Rock;
