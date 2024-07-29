import type { RockMeta, RockPropSetter } from "@ruiapp/move-style";

export default {
  $type: "linkshopAppLayout",

  name: "布局模板",

  slots: {},

  propertyPanels: [
    {
      $type: "componentPropPanel",
      title: "布局模板",
      setters: [
        {
          $type: "textPropSetter",
          label: "名称",
          propName: "$name",
          dynamicForbidden: true,
        },
        {
          $type: "colorPropSetter",
          label: "背景色",
          propName: "backgroundColor",
          dynamicForbidden: true,
        },
      ] as RockPropSetter[],
    },
  ],
} as RockMeta;
