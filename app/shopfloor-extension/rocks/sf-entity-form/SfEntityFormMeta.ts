import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfEntityForm",

  name: "表单",

  slots: {},

  voidComponent: true,

  props: {
    title: {
      valueType: "string",
      defaultValue: "表单",
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
          label: "表单项",
          propNames: ["items", "actions", "column", "$exps", "$vars"],
          defaultValue: {
            items: [],
            actions: [],
            column: 1,
          },
        },
      ],
    },
    { $type: "positionPropPanel" },
    { $type: "sizePropPanel" },
  ],
} as RockMeta;
