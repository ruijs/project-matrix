import type { RapidPage, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "sys_external_entity_list",
  name: "外部实体",
  title: "外部实体",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "SysExternalEntity",
      viewMode: "table",
      selectionMode: "none",
      orderBy: [
        {
          field: "id",
          desc: true,
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "Search",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["externalCode", "internalCode"],
        },
      ],
      searchForm: {
        entityCode: "SysExternalEntity",
        items: [
          {
            type: "auto",
            code: "externalTypeCode",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "internalTypeCode",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "internalId",
            filterMode: "eq",
          },
          {
            type: "auto",
            code: "internalCode",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "syncState",
            filterMode: "eq",
          },
          {
            type: "auto",
            code: "syncTime",
            filterMode: "range",
          },
        ],
      },
      columns: [
        {
          type: "auto",
          code: "syncState",
          width: "100px",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "170px",
        },
        {
          type: "auto",
          code: "externalTypeCode",
          width: "170px",
        },
        {
          type: "auto",
          code: "externalCode",
          width: "150px",
        },
        {
          type: "auto",
          code: "internalTypeCode",
          width: "150px",
        },
        {
          type: "auto",
          code: "internalCode",
          width: "150px",
        },
        {
          type: "auto",
          code: "syncTime",
          width: "170px",
        },
        {
          type: "auto",
          code: "syncAttempt",
          width: "100px",
        },
        {
          type: "auto",
          code: "syncError",
        },
      ],
    } satisfies SonicEntityListRockConfig,
  ],
};

export default page;
