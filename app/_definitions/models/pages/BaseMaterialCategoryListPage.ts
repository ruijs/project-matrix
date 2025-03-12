import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "treeSelect",
      code: "parent",
      formControlProps: {
        listDataSourceCode: "nodeList",
        listParentField: "parent.id",
      },
    },
    {
      type: "auto",
      code: "code",
    },
    {
      type: "auto",
      code: "name",
    },
    // {
    //   type: "auto",
    //   code: "defaultUnit",
    // },
    // {
    //   type: "auto",
    //   code: "orderNum",
    // },
    {
      type: "auto",
      code: "printTemplate",
    },
  ],
};

const page: RapidPage = {
  code: "base_material_category_list",
  name: "货品分类",
  title: "货品分类",
  permissionCheck: { any: ["baseMaterial.manage"] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "BaseMaterialCategory",
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
          placeholder: "搜索名称、编号",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code", "name"],
        },
      ],
      orderBy: [
        {
          field: "code",
        },
      ],
      convertListToTree: true,
      listParentField: "parent.id",
      pageSize: -1,
      extraProperties: ["parent"],
      columns: [
        {
          type: "auto",
          code: "code",
          width: "100px",
        },
        {
          type: "auto",
          code: "name",
        },
        // {
        //   type: "auto",
        //   code: "defaultUnit",
        //   width: "100px",
        //   rendererProps: {
        //     format: "{{name}}",
        //   },
        // },
        {
          type: "auto",
          code: "printTemplate",
          rendererProps: {
            format: "{{name}}",
          },
        },
        // {
        //   type: "auto",
        //   code: "orderNum",
        //   width: "100px",
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
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "BaseMaterialCategory",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      stores: [
        {
          type: "entityStore",
          name: "nodeList",
          entityCode: "BaseMaterialCategory",
          properties: ["id", "code", "name", "parent", "orderNum", "createdAt"],
          filters: [],
          orderBy: [
            {
              field: "id",
            },
          ],
        },
      ],
    },
  ],
};

export default page;
