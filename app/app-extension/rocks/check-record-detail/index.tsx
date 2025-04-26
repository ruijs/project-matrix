import { RockChildrenConfig, type Rock } from "@ruiapp/move-style";
import { renderRockChildren } from "@ruiapp/react-renderer";
import { useState } from "react";

export default {
  $type: "checkRecordDetail",

  slots: {},

  propertyPanels: [],

  Renderer(context, props) {
    const [visible, setVisible] = useState<boolean>(false);

    const record = props.$slot.record;

    let dataSource = [];
    let amount = 0;
    switch (props.checkResultMode) {
      case "loss":
        amount = record.diffAmount < 0 ? Math.abs(record.diffAmount) : 0;
        dataSource = record.lossGoods || [];
        break;
      case "profit":
        amount = record.diffAmount > 0 ? record.diffAmount : 0;
        dataSource = record.profitGoods || [];
        break;
    }

    const rockChildrenConfig: RockChildrenConfig = [
      {
        $type: "htmlElement",
        $id: `${props.$id}_text`,
        htmlTag: "span",
        style: amount > 0 ? { color: "#1890ff", cursor: "pointer" } : {},
        children: [
          {
            $type: "text",
            text: amount,
          },
        ],
        onClick: [
          {
            $action: "script",
            script: () => {
              if (!amount) {
                return;
              }

              setVisible(true);
            },
          },
        ],
      },
      {
        $type: "antdModal",
        $id: `${props.$id}_modal`,
        title: "差异明细",
        open: visible,
        width: 500,
        footer: false,
        children: [
          {
            $type: "antdTable",
            rowKey: "id",
            dataSource: dataSource,
            size: "middle",
            scroll: { x: 300 },
            pagination: false,
            columns: [
              {
                title: "序号",
                dataIndex: "sort",
                width: 60,
                render: (_: any, r: any, i: number) => `${i + 1}`,
              },
              {
                title: "托编号",
                dataIndex: "binNum",
                width: 140,
              },
              {
                title: "数量",
                dataIndex: "quantity",
                width: 100,
              },
            ],
          },
        ],
        onCancel: [
          {
            $action: "script",
            script: () => {
              setVisible(false);
            },
          },
        ],
      },
    ];

    return renderRockChildren({ context, rockChildrenConfig });
  },
} as Rock<any>;
