import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfEntityDetails",

  name: "记录详情",

  slots: {},

  voidComponent: true,

  props: {
    title: {
      valueType: "string",
      defaultValue: "详情",
    },
    height: {
      valueType: "number",
      defaultValue: 300,
    },
    width: {
      valueType: "number",
      defaultValue: 300,
    },
  },

  events: [],

  propertyPanels: [
    {
      $type: "componentPropPanel",
      setters: [
        {
          $type: "textPropSetter",
          label: "名称",
          propName: "$name",
        },
        {
          $type: "storeEntityPropSetter",
          label: "数据模型",
          propName: "entityConfig",
        },
        {
          $type: "jsonPropsSetter",
          label: "展示信息",
          propNames: ["items", "column", "$exps", "$vars"],
          defaultValue: {
            column: 3,
            items: [],
          },
        },
      ],
    },
    { $type: "positionPropPanel" },
    { $type: "sizePropPanel" },
  ],
} as RockMeta;
