import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfRadioGroup",

  name: "日期",

  voidComponent: true,

  props: {
    value: {
      valueType: "string",
      defaultValue: '',
      onChangeEventName: "onChange",
    },
    list: {
      valueType: "object",
      defaultValue: []
    },
    fontSize: {
      valueType: "number",
      defaultValue: 14,
    },
    direction: {
      valueType: 'string',
      defaultValue: 'horizontal',
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
        },
        {
          $type: "arrayPropSetter",
          label: "选项列表",
          propName: "list",
        },
        {
          $type: "numberPropSetter",
          label: "文字大小",
          propName: "fontSize",
        },
        {
          $type: "selectPropSetter",
          label: "方向",
          propName: "direction",
          options: [
            { label: "水平", value: "horizontal" },
            { label: "垂直", value: "vertical" },
          ],
        },
      ],
    },
    { $type: "positionPropPanel" },
    { $type: "sizePropPanel" },
  ],
} as RockMeta;
