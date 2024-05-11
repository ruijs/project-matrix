import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfDatePicker",

  name: "日期选择器",

  voidComponent: true,

  props: {},

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
