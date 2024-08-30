import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfDateSelect",

  name: "日期",

  voidComponent: true,

  props: {
    value: {
      valueType: "string",
      defaultValue: '2014/04/08',
      onChangeEventName: "onChange",
    },
    width: {
      valueType: "string",
      defaultValue: "100px",
    },

    height: {
      valueType: "string",
      defaultValue: "30px",
    },

    left: {
      valueType: "string",
      defaultValue: "0px",
    },

    top: {
      valueType: "string",
      defaultValue: "0px",
    },
  },

  slots: {},

  propertyPanels: [
    {
      $type: "componentPropPanel",
      title: "常规",
      setters: [
        {
          $type: "textPropSetter",
          label: "值",
          propName: "value",
        }
      ],
    },
    { $type: "positionPropPanel" },
    { $type: "sizePropPanel" },
  ],
} as RockMeta;
