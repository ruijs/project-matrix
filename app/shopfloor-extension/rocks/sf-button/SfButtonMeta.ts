import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfButton",

  name: "按钮",

  slots: {},

  voidComponent: true,

  props: {
    text: {
      valueType: "string",
      defaultValue: "按钮",
    },
    height: {
      valueType: "number",
      defaultValue: 40,
    },
    width: {
      valueType: "number",
      defaultValue: 100,
    },
  },

  events: [
    {
      name: "onClick",
      label: "onClick",
      args: {},
    },
  ],

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
          $type: "textPropSetter",
          label: "文字",
          propName: "text",
        },
        {
          $type: "textPropSetter",
          label: "图标",
          propName: "icon",
        },
        {
          $type: "colorPropSetter",
          label: "字体颜色",
          propName: "color",
        },
        {
          $type: "colorPropSetter",
          label: "背景颜色",
          propName: "backgroundColor",
        },
        {
          $type: "selectPropSetter",
          label: "图标位置",
          propName: "iconPosition",
          options: [
            { label: "左", value: "left" },
            { label: "右", value: "right" },
            { label: "上", value: "top" },
          ],
        },
      ],
    },
    { $type: "positionPropPanel" },
    { $type: "sizePropPanel" },
    { $type: "borderPropPanel" },
  ],
} as RockMeta;
