import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfSinglePicker",

  name: "单选-选择器",

  voidComponent: true,

  props: {
    height: {
      valueType: "number",
      defaultValue: 40,
    },
    width: {
      valueType: "number",
      defaultValue: 120,
    },
  },

  slots: {},

  propertyPanels: [
    {
      $type: "componentPropPanel",
      setters: [
        {
          $type: "textPropSetter",
          label: "名称",
          propName: "$name",
        },
      ],
    },
    { $type: "positionPropPanel" },
    { $type: "sizePropPanel" },
  ],
} as RockMeta;
