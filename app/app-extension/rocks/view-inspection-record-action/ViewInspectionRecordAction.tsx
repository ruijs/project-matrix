import { MoveStyleUtils, RockChildrenConfig, RockEvent, type Rock } from "@ruiapp/move-style";
import { renderRockChildren } from "@ruiapp/react-renderer";
import { useSetState } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { get, sumBy } from "lodash";
import { rapidApiRequest } from "~/rapidApi";
import { renderCharacteristicQualifiedConditions } from "~/utils/fmt";
import { Tag } from "antd";

export default {
  $type: "viewInspectionRecordAction",

  slots: {},

  propertyPanels: [],

  Renderer(context, props) {
    const { record } = props;

    const [currentState, setCurrentState] = useSetState<{ visible?: boolean }>({});

    const { loadInspectionSpecItems, inspectionSpecItems, loading } = useInspectionSpecItems();

    useEffect(() => {
      if (currentState.visible) {
        loadInspectionSpecItems({ materialId: record.material.id, lotNum: record.lotNum });
      }
    }, [currentState.visible]);

    const closeModal = () => {
      setCurrentState({ visible: false });
    };

    const rockChildrenConfig: RockChildrenConfig = [
      {
        ...(MoveStyleUtils.omitSystemRockConfigFields(props) as any),
        $type: "rapidTableAction",
        onAction: [
          {
            $action: "script",
            script: () => {
              setCurrentState({ visible: true });
            },
          },
        ],
      },
      {
        $id: `${props.$id}_${props.recordId}_modal`,
        $type: "antdModal",
        title: "检验指标",
        footer: false,
        open: currentState.visible,
        bodyStyle: { padding: 8 },
        children: [
          {
            $id: `${props.$id}_${props.recordId}_table`,
            $type: "antdTable",
            size: "small",
            rowKey: "id",
            loading: loading,
            dataSource: inspectionSpecItems || [],
            pagination: false,
            columns: [
              {
                title: "指标名称",
                dataIndex: "characteristic",
                width: 180,
                render: (c: any, r: any) => {
                  return get(r, "characteristic.name");
                },
              },
              {
                title: "标准值",
                dataIndex: "normal",
                width: 120,
                render: (_: any, r: any) => {
                  return renderCharacteristicQualifiedConditions(r.characteristic);
                },
              },
              {
                title: "实测值",
                dataIndex: "value",
                width: 120,
                render: (_: any, r: any) => {
                  switch (r.characteristic?.kind) {
                    case "qualitative":
                      return <Tag color={r.isQualified ? "success" : "error"}>{get(r, "qualitativeValue")}</Tag>;
                    case "quantitative":
                      return <Tag color={r.isQualified ? "success" : "error"}>{get(r, "quantitativeValue")}</Tag>;
                  }
                },
              },
            ],
          },
        ],
        onCancel: [
          {
            $action: "script",
            script: () => {
              closeModal();
            },
          },
        ],
      },
    ];

    return renderRockChildren({ context, rockChildrenConfig });
  },
} as Rock<any>;

export function useInspectionSpecItems() {
  const [loading, setLoading] = useState<boolean>(false);
  const [inspectionSpecItems, setInspectionSpecItems] = useState<any[]>([]);

  const loadInspectionSpecItems = async (params: { materialId: string; lotNum: string }) => {
    if (loading) {
      return;
    }

    setLoading(true);
    const { error, result } = await rapidApiRequest({
      url: `/mom/mom_inspection_sheets/operations/find`,
      method: "POST",
      data: {
        filters: [
          {
            field: "material_id",
            operator: "eq",
            value: params.materialId,
          },
          {
            field: "lotNum",
            operator: "eq",
            value: params.lotNum,
          },
        ],
        pagination: {
          limit: 1000,
        },
      },
    });

    if (!error && !!result?.list?.length) {
      const { error: recordError, result: recordResult } = await rapidApiRequest({
        url: `/mom/mom_inspection_measurements/operations/find`,
        method: "POST",
        data: {
          filters: [
            {
              field: "sheet_id",
              operator: "in",
              value: result.list.map((item: any) => item.id),
            },
          ],
          properties: ["id", "characteristic", "qualitativeValue", "quantitativeValue", "isQualified"],
          pagination: {
            limit: 1000,
          },
        },
      });
      if (!recordError) {
        setInspectionSpecItems(recordResult?.list || []);
      }
    }

    setLoading(false);
  };

  return { loadInspectionSpecItems, inspectionSpecItems, loading };
}
