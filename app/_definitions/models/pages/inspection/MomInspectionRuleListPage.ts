import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";
import { materialFormatStrTemplate } from "~/utils/fmt";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "name",
      required: true,
    },
    {
      type: "auto",
      code: "material",
      formControlProps: {
        listSearchable: true,
        dropdownMatchSelectWidth: 500,
        listTextFormat: materialFormatStrTemplate,
        listFilterFields: ["name", "code", "specification"],
        columns: [
          { code: "code", title: "编号", width: 120 },
          { code: "name", title: "名称", width: 120 },
          { code: "specification", title: "规格", width: 120 },
        ],
      },
      required: true,
    },
    {
      type: "auto",
      code: "category",
      required: true,
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
    // {
    //   type: "auto",
    //   code: "customer",
    //   listDataFindOptions: {
    //     fixedFilters: [
    //       {
    //         field: "categories",
    //         operator: "exists",
    //         filters: [
    //           {
    //             field: "code",
    //             operator: "eq",
    //             value: "customer",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   formControlProps: {
    // listSearchable: true,
    // dropdownMatchSelectWidth: 300,
    // listTextFormat: "{{code}}-{{name}}",
    // listFilterFields: ["name", "code"],
    // columns: [
    //   { code: "code", title: "编号", width: 120 },
    //   { code: "name", title: "名称", width: 120 },
    // ],
    //   },
    // },
    // {
    //   type: "auto",
    //   code: "config",
    // },
    // {
    //   type: "auto",
    //   code: "isDefault",
    // },
  ],
  defaultFormFields: {
    isDefault: "false",
  },
};

const page: RapidPage = {
  code: "mom_inspection_rule_list",
  name: "检验配置",
  title: "检验配置",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomInspectionRule",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
          $permissionCheck: "inspectionRule.manage",
        },
      ],
      fixedFilters: [
        {
          field: "customer",
          operator: "null",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索名称",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["name"],
        },
      ],
      orderBy: [
        {
          field: "id",
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "link",
          code: "name",
          fixed: "left",
          rendererType: "link",
          rendererProps: {
            url: "/pages/mom_inspection_rule_details?id={{id}}",
          },
        },
        {
          type: "auto",
          code: "category",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "material",
          rendererProps: {
            format: materialFormatStrTemplate,
          },
        },
        // {
        //   type: "auto",
        //   code: "customer",
        //   rendererProps: {
        //     format: "{{code}}-{{name}}",
        //   },
        // },
        // {
        //   type: "auto",
        //   code: "routeProcess",
        //   rendererProps: {
        //     format: "{{aliasName}}",
        //   },
        // },
        // {
        //   type: "auto",
        //   code: "config",
        // },
        // {
        //   type: "auto",
        //   code: "isDefault",
        // },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
          $permissionCheck: "inspectionRule.manage",
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "MomInspectionRule",
          $permissionCheck: "inspectionRule.manage",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
    },
  ],
};

export default page;
