import type { RapidPage, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "sys_event_log_list",
  name: "事件日志",
  title: "事件日志",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "SysEventLog",
      viewMode: "table",
      selectionMode: "none",
      extraProperties: ["sourceType", "sourceName"],
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
          filterFields: ["targetCode", "targetName"],
        },
      ],
      searchForm: {
        entityCode: "SysEventLog",
        items: [
          {
            type: "auto",
            code: "time",
            filterMode: "range",
          },
          {
            type: "auto",
            code: "sourceType",
            filterMode: "eq",
          },
          {
            type: "auto",
            code: "sourceName",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "level",
            filterMode: "eq",
          },
          {
            type: "auto",
            code: "eventType",
            filterMode: "eq",
          },
          {
            type: "auto",
            code: "operator",
            filterMode: "eq",
          },
          {
            type: "auto",
            code: "targetTypeCode",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "targetCode",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "targetName",
            filterMode: "contains",
          },
        ],
      },
      columns: [
        {
          type: "auto",
          code: "time",
          width: "170px",
          fixed: "left",
        },
        {
          type: "auto",
          code: "level",
          width: "80px",
        },
        {
          type: "auto",
          code: "sourceType",
          title: "来源",
          width: "100px",
        },
        {
          type: "auto",
          code: "eventType",
          width: "150px",
        },
        {
          type: "auto",
          code: "operator",
          width: "150px",
        },
        {
          type: "auto",
          code: "targetName",
          title: "操作对象",
          width: "150px",
        },
        {
          type: "auto",
          code: "ip",
          width: "150px",
        },
        {
          type: "auto",
          code: "message",
        },
      ],
    } satisfies SonicEntityListRockConfig,
  ],
};

export default page;
