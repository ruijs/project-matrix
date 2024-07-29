import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "linkshopAppStep",

  name: "步骤",

  slots: {},

  propertyPanels: [
    {
      $type: "componentPropPanel",
      setters: [
        {
          $type: "textPropSetter",
          label: "名称",
          propName: "$name",
          dynamicForbidden: true,
        },
        {
          $type: "linkshoStepLayoutPropSetter",
          label: "布局",
          propName: "layoutId",
          allowClear: true,
        },
        {
          $type: "colorPropSetter",
          label: "背景色",
          propName: "backgroundColor",
        },
        {
          $type: "timePropSetter",
          label: "节拍时间",
          propName: "cycleTime",
        },
      ],
    },
  ],
} as RockMeta;
