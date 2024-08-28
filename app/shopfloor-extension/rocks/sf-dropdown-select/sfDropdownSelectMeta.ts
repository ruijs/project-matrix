import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfDropdownSelect",

  name: "图标",

  voidComponent: true,

  props: {
    value: {
      valueType: "string",
      onChangeEventName: "onChange"
    },

    width: {
      valueType: "string",
      defaultValue: "32px",
    },

    height: {
      valueType: "string",
      defaultValue: "32px",
    },

    left: {
      valueType: "string",
      defaultValue: "0px",
    },

    top: {
      valueType: "string",
      defaultValue: "0px",
    },

    list: {
      valueType: "object",
      defaultValue: []
    }
  },

  slots: {},

  propertyPanels: [
    {
      $type: "componentPropPanel",
      setters: [
        {
          $type: "textPropSetter",
          label: "值",
          propName: "value",
        },
        {
          $type: "arrayPropSetter",
          label: "选项列表",
          propName: "list",
        },
      ],
    },
    { $type: "positionPropPanel" },
    { $type: "sizePropPanel" },
  ],
} as RockMeta;
