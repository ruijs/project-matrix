import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfSingleSelector",

  name: "单选-选择组",

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
