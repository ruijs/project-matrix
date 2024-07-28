import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfText",

  name: "文本",

  voidComponent: true,

  props: {
    text: {
      valueType: "string",
      defaultValue: "文本",
    },

    fontSize: {
      valueType: "number",
      defaultValue: 16,
    },

    color: {
      valueType: "string",
      defaultValue: "#000000d9",
    },

    letterSpacing: {
      valueType: "number",
      defaultValue: 0,
    },

    horizontalAlignment: {
      valueType: "string",
      defaultValue: "left",
    },

    verticalAlignment: {
      valueType: "string",
      defaultValue: "center",
    },

    fontWeightIsBold: {
      valueType: "boolean",
      defaultValue: false,
    },

    fontStyleIsOblique: {
      valueType: "boolean",
      defaultValue: false,
    },

    textDecorationLine: {
      valueType: "string",
      defaultValue: 'none',
    },

    textDecorationStyle: {
      valueType: "string",
      defaultValue: 'solid',
    },

    textDecorationColor: {
      valueType: 'string',
      defaultValue: "#000000d9",
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
          label: "文本",
          propName: "text",
        },
        {
          $type: "numberPropSetter",
          label: "文字大小",
          propName: "fontSize",
        },
        {
          $type: "colorPropSetter",
          label: "文本颜色",
          propName: "color",
        },
        {
          $type: "numberPropSetter",
          label: "文字间距",
          propName: "letterSpacing",
        },
        {
          $type: "selectPropSetter",
          label: "左右对齐",
          propName: "horizontalAlignment",
          options: [
            {
              label: "局左",
              value: "left",
            },
            {
              label: "居中",
              value: "center",
            },
            {
              label: "居右",
              value: "right",
            },
          ],
        },
        {
          $type: "selectPropSetter",
          label: "上下对齐",
          propName: "verticalAlignment",
          options: [
            {
              label: "居上",
              value: "flex-start",
            },
            {
              label: "居中",
              value: "center",
            },
            {
              label: "居下",
              value: "flex-end",
            },
          ],
        },
        {
          $type: "switchPropSetter",
          label: "加粗",
          propName: "fontWeightIsBold",
        },
        {
          $type: "switchPropSetter",
          label: "斜体",
          propName: "fontStyleIsOblique",
        },
        {
          $type: "selectPropSetter",
          label: "划线样式",
          propName: "textDecorationLine",
          options: [
            {
              label: "无",
              value: "none",
            },
            {
              label: "下划线",
              value: "underline",
            },
            {
              label: "上划线",
              value: "overline",
            },
            {
              label: "文本线",
              value: "line-through",
            },
          ],
        },
        {
          $type: "selectPropSetter",
          label: "划线类型",
          propName: "textDecorationStyle",
          options: [
            {
              label: "实线",
              value: "solid",
            },
            {
              label: "双线",
              value: "double",
            },
            {
              label: "点线",
              value: "dotted",
            },
            {
              label: "虚线",
              value: "dashed",
            },
            {
              label: "波浪线",
              value: "wavy",
            },
          ],
        },
        {
          $type: "colorPropSetter",
          label: "划线颜色",
          propName: "textDecorationColor",
        },
      ],
    },
    { $type: "positionPropPanel" },
    { $type: "sizePropPanel" },
  ],
} as RockMeta;
