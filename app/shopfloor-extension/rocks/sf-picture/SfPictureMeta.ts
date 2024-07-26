import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "sfPicture",

  name: "图片",

  voidComponent: true,

  props: {
    borderStyle: {
      valueType: 'string',
      defaultValue: 'none'
    },

    borderColor: {
      valueType: 'string',
      defaultValue: 'none'
    },

    borderWidth: {
      valueType: 'number',
      defaultValue: 2
    },

    borderRaduis: {
      valueType: 'number',
      defaultValue: 0
    },

    width: {
      valueType: "string",
      defaultValue: "100px",
    },

    height: {
      valueType: "string",
      defaultValue: "100px",
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
      setters: [
        {
          $type: "textPropSetter",
          label: "名称",
          propName: "$name",
        },
        {
          $type: "filePropSetter",
          label: "地址",
          propName: "fileObj",
          accept: ".jpg",
        },
        {
          $type: "selectPropSetter",
          label: "边框",
          propName: "borderStyle",
          options: [
            {
              label: "无",
              value: "none",
            },
            {
              label: "实线",
              value: "solid",
            },
            {
              label: "虚线",
              value: "dashed",
            },
            {
              label: "点线",
              value: "dotted",
            },
            {
              label: "双线",
              value: "double",
            },
          ],
        },
        {
          $type: "colorPropSetter",
          label: "边框颜色",
          propName: "borderColor",
        },
        {
          $type: "numberPropSetter",
          label: "边框粗细",
          propName: "borderWidth",
        },
        {
          $type: "numberPropSetter",
          label: "边框圆角",
          propName: "borderRadius",
        },
      ],
    },
    { $type: "positionPropPanel" },
    { $type: "sizePropPanel" },
  ],
} as RockMeta;
