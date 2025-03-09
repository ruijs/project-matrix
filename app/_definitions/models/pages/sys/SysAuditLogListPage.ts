import type {RapidPage} from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "sys_audit_log_list",
  name: "系统操作日志",
  title: "系统操作日志",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "SysAuditLog",
      viewMode: "table",
      selectionMode: "none",
      orderBy: [
        {
          field: "createdAt",
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
          filterFields: ["targetSingularName", "targetSingularCode"],
        },
      ],
      columns: [
        {
          type: "auto",
          code: "user",
          width: "150px",
          fixed: "left",
        },
        {
          type: "auto",
          code: "targetSingularCode",
          width: "100px",
        },
        {
          type: "auto",
          code: "targetSingularName",
          width: "100px",
        },
        {
          type: "auto",
          code: "method",
        },
        // {
        //   type: "auto",
        //   code: "changes",
        // },
        {
          type: "auto",
          code: "createdAt",
        }
      ],
      searchForm: {
        entityCode: "SysAuditLog",
        items: [
          {
            type: "auto",
            code: "method",
            filterMode: "eq",
          },
          {
            type: "auto",
            code: "targetSingularCode",
            filterMode: "eq",
          },
          {
            type: "auto",
            code: "user",
            filterMode: "eq"
          },
        ],
      },
    },
  ],
};

export default page;
