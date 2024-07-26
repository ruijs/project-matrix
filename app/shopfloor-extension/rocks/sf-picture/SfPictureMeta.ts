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
          label: "图片",
          propName: "fileObj",
          accept: ".jpg,.jpeg,.png,.gif,.apng,.bmp,.svg,.webp,.tif",
        },
      ],
    },
    { $type: "positionPropPanel" },
    { $type: "sizePropPanel" },
    { $type: "borderPropPanel"}
  ],
} as RockMeta;
