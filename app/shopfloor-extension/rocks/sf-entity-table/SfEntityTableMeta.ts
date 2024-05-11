import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfEntityTable",

  name: "数据表格",

  slots: {},

  voidComponent: true,

  props: {
    title: {
      valueType: "string",
      defaultValue: "表格",
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
          label: "表格",
          propNames: [
            "columns",
            "listActions",
            "extraActions",
            "actions",
            "fixedFilters",
            "selectionMode",
            "selectOnClickRow",
            "onSelectedIdsChange",
            "$exps",
            "$vars",
          ],
        },
      ],
    },
    { $type: "positionPropPanel" },
    { $type: "sizePropPanel" },
  ],
} as RockMeta;
