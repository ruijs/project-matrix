import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";
import { materialFormatStrTemplate } from "~/utils/fmt";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "material",
      formControlProps: {
        dropdownMatchSelectWidth: 500,
        listTextFormat: materialFormatStrTemplate,
        listFilterFields: ["name", "code", "specification"],
        columns: [
          { code: "code", title: "编号", width: 120 },
          { code: "name", title: "名称", width: 120 },
          { code: "specification", title: "规格", width: 120 },
        ],
      },
    },
    // {
    //   type: "auto",
    //   code: "warehouse",
    // },
    {
      type: "auto",
      code: "unit",
    },
    // {
    //   type: "auto",
    //   code: "allocableQuantity",
    // },
    {
      type: "auto",
      code: "onHandQuantity",
    },
    // {
    //   type: "auto",
    //   code: "allocatedQuantity",
    // },
  ],
};

const page: RapidPage = {
  code: "mom_material_warehouse_inventory_balance_list",
  name: "库存查询",
  title: "库存查询",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomMaterialWarehouseInventoryBalance",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
        },
        // {
        //   $type: "sonicToolbarRefreshButton",
        //   text: "刷新",
        //   icon: "ReloadOutlined",
        // },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          formControlProps: {
            style: { width: 260 },
          },
          placeholder: "搜索物品名称、编号、规格",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: [
            {
              field: "material",
              operator: "exists",
              filters: [
                {
                  operator: "or",
                  filters: [
                    {
                      field: "name",
                      operator: "contains",
                    },
                    {
                      field: "code",
                      operator: "contains",
                    },
                    {
                      field: "specification",
                      operator: "contains",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "auto",
          code: "material",
          rendererType: "anchor",
          rendererProps: {
            children: {
              $type: "materialLabelRenderer",
              $exps: {
                value: "$slot.value",
              },
            },
            $exps: {
              href: "$rui.execVarText('/pages/base_material_details?id={{id}}', $slot.value)",
            },
          },
        },
        // {
        //   type: "auto",
        //   code: "warehouse",
        //   rendererProps: {
        //     format: "{{code}}-{{name}}",
        //   },
        // },
        {
          type: "auto",
          code: "unit",
          width: "50px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        // {
        //   type: "auto",
        //   code: "allocableQuantity",
        // },
        {
          type: "auto",
          code: "onHandQuantity",
        },
        // {
        //   type: "auto",
        //   code: "allocatedQuantity",
        // },
      ],
      actionsColumnWidth: "80px",
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
          entityCode: "MomMaterialWarehouseInventoryBalance",
        },
      ],
      newForm: cloneDeep(formConfig) as RapidEntityFormConfig,
      editForm: cloneDeep(formConfig) as RapidEntityFormConfig,
    },
  ],
};

export default page;
