import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "factory",
    },
    {
      type: "auto",
      code: "code",
    },
    {
      type: "auto",
      code: "name",
    },
    {
      type: "auto",
      code: "category",
    },
    {
      type: "auto",
      code: "equipments",
    },
    {
      type: "auto",
      code: "outputs",
    },
    {
      type: "auto",
      code: "orderNum",
    },
    {
      type: "auto",
      code: "carModel",
    },
    {
      type: "auto",
      code: "partNumber",
    },
    {
      type: "auto",
      code: "partName",
    },
    {
      type: "auto",
      code: "conf",
    },
    {
      type: "auto",
      code: "partManager",
    },
  ],
};

const page: RapidPage = {
  code: "mom_process_list",
  name: "工序列表",
  title: "工序管理",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomProcess",
      viewMode: "table",
      selectionMode: "none",
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
          placeholder: "搜索名称、编码",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code", "name"],
        },
      ],
      orderBy: [
        {
          field: "orderNum",
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "auto",
          code: "factory",
          width: "100px",
          fixed: "left",
        },
        {
          type: "link",
          code: "code",
          rendererType: "rapidLinkRenderer",
          rendererProps: {
            url: "/pages/mom_process_details?id={{id}}",
          },
          width: "150px",
        },
        {
          type: "auto",
          code: "name",
        },
        {
          type: "auto",
          code: "category",
          width: "100px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "equipments",
          rendererProps: {
            item: {
              $type: "rapidObjectRenderer",
              format: "{{code}}-{{name}}",
            },
          },
        },
        {
          type: "auto",
          code: "outputs",
          rendererProps: {
            item: {
              $type: "rapidObjectRenderer",
              format: "{{code}}-{{name}}",
            },
          },
        },
        {
          type: "auto",
          code: "orderNum",
          width: "100px",
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "MomProcess",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
    },
  ],
};

export default page;
