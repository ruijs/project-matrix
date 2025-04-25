import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig, RapidEntityTableSelectConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [],
};

const page: RapidPage = {
  code: "mom_inventory_search_list",
  name: "库存查询列表",
  title: "库存查询",
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomMaterialInventoryBalance",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "antdButton",
          href: `/api/app/exportExcel?type=inventory`,
          $exps: {
            href: "'/api/app/exportExcel?type=inventory&materialCategory=' + $scope.vars.materialCategory",
          },
          children: [
            {
              $type: "text",
              text: " 下载",
            },
          ],
        },
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
      searchForm: {
        entityCode: "MomMaterialInventoryBalance",
        items: [
          {
            type: "auto",
            code: "materialCategory",
            label: "物料类型",
            formControlType: "rapidEntityTableSelect",
            formControlProps: {
              entityCode: "BaseMaterialCategory",
              mode: "multiple",
            } satisfies RapidEntityTableSelectConfig,
            filterMode: "in",
            filterFields: [
              {
                field: "material",
                operator: "exists",
                filters: [
                  {
                    field: "category",
                    operator: "exists",
                    filters: [
                      {
                        field: "id",
                        operator: "in",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        onValuesChange: [
          {
            $action: "script",
            script: `
              const changedValues = event.args[0] || {};
              if(changedValues.hasOwnProperty('materialCategory')){
                event.scope.setVars({
                  materialCategory: changedValues?.materialCategory,
                }, true);
              }
            `,
          },
        ],
      },
      pageSize: 20,
      relations: {
        material: {
          properties: ["id", "code", "name", "specification", "category"],
        },
      },
      columns: [
        {
          type: "auto",
          code: "material.code",
          title: "物料编号",
        },
        {
          type: "auto",
          code: "material.name",
          title: "物料名称",
        },
        {
          type: "auto",
          code: "material.specification",
          title: "规格",
        },
        {
          type: "auto",
          code: "material",
          title: "物料类型",
          rendererProps: {
            format: "{{category.name}}",
          },
        },
        {
          type: "auto",
          title: "库存数量",
          code: "onHandQuantity",
          width: "120px",
        },
        {
          type: "auto",
          code: "unit",
          width: "100px",
        },
      ],
      actionsColumnWidth: "200px",
      actions: [
        {
          $type: "inventoryDetailViewer",
          contentType: "locationDetail",
          actionText: "库位明细",
        },
        {
          $type: "inventoryDetailViewer",
          contentType: "lotNumDetail",
          actionText: "批次明细",
        },
        {
          $type: "inventoryDetailViewer",
          contentType: "binNumDetail",
          actionText: "组托明细",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
    },
  ],
};

export default page;
