import type { RapidEntityFormConfig, RapidPage, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";
import { cloneDeep } from "lodash";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "module",
    },
    {
      type: "auto",
      code: "code",
    },
    {
      type: "auto",
      code: "name",
    },
  ],
};

const page: RapidPage = {
  code: "sys_event_type_list",
  name: "事件类型",
  title: "事件类型",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "SysEventType",
      viewMode: "table",
      selectionMode: "none",
      orderBy: [
        {
          field: "name",
        },
      ],
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "Search",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code", "name"],
        },
      ],
      searchForm: {
        entityCode: "SysEventType",
        items: [
          {
            type: "auto",
            code: "module",
            filterMode: "eq",
          },
          {
            type: "auto",
            code: "code",
            filterMode: "contains",
          },
          {
            type: "auto",
            code: "name",
            filterMode: "contains",
          },
        ],
      },
      columns: [
        {
          type: "auto",
          code: "code",
          width: "250px",
        },
        {
          type: "auto",
          code: "name",
          width: "250px",
        },
        {
          type: "auto",
          code: "module",
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
    } satisfies SonicEntityListRockConfig,
  ],
};

export default page;
