import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      code: "code",
      type: "auto",
    },
    {
      code: "name",
      type: "auto",
    },
    {
      code: "orderNum",
      type: "auto",
    },
    {
      type: "switch",
      code: "config",
      label: "开启通知",
      valueFieldName: "config.enableDingTalkNotification",
    },
    {
      type: "textarea",
      code: "config",
      label: "通知文字",
      valueFieldName: "config.dingTalkNotificationContent",
    },
    {
      type: "auto",
      code: "notificationSubscribers",
    },
  ],
};

const page: RapidPage = {
  code: "mom_inspection_category_list",
  name: "检验类型列表",
  title: "检验类型管理",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomInspectionCategory",
      viewMode: "table",
      selectionMode: "none",
      orderBy: [
        {
          field: "code",
        },
      ],
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
          $permissionCheck: "inspectionCategory.manage",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索名称、编码",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code", "name"],
        },
      ],
      columns: [
        {
          type: "link",
          code: "code",
          width: "100px",
          fixed: "left",
        },
        {
          type: "auto",
          code: "name",
          width: "200px",
          fixed: "left",
        },
        {
          type: "auto",
          code: "orderNum",
          width: "100px",
        },
        {
          type: "auto",
          code: "config",
          title: "开启通知",
          width: "100px",
          rendererType: "rapidBoolRenderer",
          fieldName: "config.enableDingTalkNotification",
        },
        {
          type: "auto",
          code: "notificationSubscribers",
          rendererProps: {
            item: {
              $type: "rapidObjectRenderer",
              format: "{{name}}",
            },
          },
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
          $permissionCheck: "inspectionCategory.manage",
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "MomInspectionCategory",
          $permissionCheck: "inspectionCategory.manage",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      searchForm: {
        entityCode: "MomInspectionCategory",
        items: [
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
    } satisfies SonicEntityListRockConfig,
  ],
};

export default page;
