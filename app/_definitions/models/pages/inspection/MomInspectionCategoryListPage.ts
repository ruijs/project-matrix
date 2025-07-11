import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

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
      code: "config",
      type: "auto",
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
          field: "orderNum",
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
          fixed: "left",
        },
        {
          type: "auto",
          code: "orderNum",
          width: "100px",
          fixed: "left",
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
    },
  ],
};

export default page;
