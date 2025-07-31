import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "treeSelect",
      code: "category",
      formControlProps: {
        listDataSourceCode: "categories",
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
    {
      type: "auto",
      code: "defaultUnit",
    },
    {
      type: "auto",
      code: "qualityGuaranteePeriod",
    },
    {
      type: "auto",
      code: "brand",
    },
    {
      type: "textarea",
      code: "specification",
    },
    {
      type: "textarea",
      code: "description",
    },
    {
      type: "auto",
      code: "canProduce",
    },
    {
      type: "auto",
      code: "canPurchase",
    },
    {
      type: "auto",
      code: "canSale",
    },
    {
      type: "auto",
      code: "isInspectionFree",
    },
    {
      type: "auto",
      code: "factory",
    },
    {
      type: "auto",
      code: "state",
    },
    {
      type: "auto",
      code: "safetyStockQuantity",
    },
    {
      type: "auto",
      code: "stockUpperLimit",
    },
  ],
};

const page: RapidPage = {
  code: "base_material_list",
  name: "货品管理",
  title: "货品管理",
  permissionCheck: { any: ["baseMaterial.manage"] },
  view: [
    {
      $id: "mainLayout",
      $type: "sonicMainSecondaryLayout",
      mainTitle: "货品分类",
      mainColSpan: 4,
      secondaryTitle: "货品",
      secondaryColSpan: 20,
      main: {
        $type: "antdTree",
        blockNode: true,
        showLine: true,
        defaultExpandAll: true,
        fieldNames: { key: "id", title: "name" },
        titleRender: {
          $type: "text",
          $exps: {
            text: "$slot.nodeData.code + ' ' + $slot.nodeData.name",
          },
        },
        // onSelect: {
        //   $action: "setComponentProperty",
        //   componentId: "lblName",
        //   propName: "text",
        //   propValue: ([ , eventArgs]: any) => eventArgs.selected && eventArgs.node.name
        // },
        $exps: {
          treeData: "$rui.listToTree($scope.stores.categories.data?.list, { listParentField: 'parent.id'})",
        },
        onSelect: [
          {
            $action: "sendComponentMessage",
            componentId: "mainLayout",
            message: {
              name: "notifySelectedIdsChange",
              payload: {
                selectedIds: [],
              },
            },
            $exps: {
              "message.payload.selectedIds": "$event.args[0]",
            },
          },
          // {
          //   $action: "setVars",
          //   scopeId: "package_list-scope",
          //   $exps: {
          //     "vars.activeId": "_.first($event.args[0])"
          //   }
          // }
        ],
      },
      secondary: [
        {
          $type: "sonicEntityList",
          entityCode: "BaseMaterial",
          viewMode: "table",
          selectionMode: "none",
          fixedFilters: [
            {
              field: "category_id",
              operator: "eq",
              value: "",
            },
          ],
          listActions: [
            {
              $type: "sonicToolbarNewEntityButton",
              text: "新建",
              icon: "PlusOutlined",
              actionStyle: "primary",
              // $exps: {
              //   _hidden: "!$scope.vars.activeId",
              // }
            },
          ],
          extraActions: [
            {
              $type: "sonicToolbarFormItem",
              formItemType: "search",
              formControlProps: {
                style: { width: 260 },
              },
              placeholder: "搜索名称、编号、规格",
              actionEventName: "onSearch",
              filterMode: "contains",
              filterFields: ["code", "name", "specification"],
            },
          ],
          orderBy: [
            {
              field: "code",
            },
          ],
          pageSize: 20,
          columns: [
            {
              type: "link",
              code: "code",
              fixed: "left",
              width: "150px",
              rendererType: "link",
              rendererProps: {
                url: "/pages/base_material_details?id={{id}}",
              },
            },
            {
              type: "link",
              code: "name",
              fixed: "left",
              width: "200px",
              rendererType: "link",
              rendererProps: {
                url: "/pages/base_material_details?id={{id}}",
              },
            },
            {
              type: "auto",
              code: "defaultUnit",
              width: "100px",
              rendererProps: {
                format: "{{name}}",
              },
            },
            {
              type: "auto",
              code: "qualityGuaranteePeriod",
              width: "100px",
            },
            {
              type: "auto",
              code: "brand",
              width: "100px",
            },
            {
              type: "auto",
              code: "specification",
            },
            {
              type: "auto",
              code: "state",
              width: "100px",
            },
            {
              type: "auto",
              code: "safetyStockQuantity",
            },
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
              entityCode: "BaseMaterial",
            },
          ],
          newForm: cloneDeep(formConfig),
          editForm: cloneDeep(formConfig),
          stores: [
            {
              type: "entityStore",
              name: "categories",
              entityCode: "BaseMaterialCategory",
              properties: ["id", "code", "name", "parent", "orderNum"],
              orderBy: [
                {
                  field: "orderNum",
                },
              ],
            },
          ],
          $exps: {
            "fixedFilters[0].value": "$scope.vars.activeId",
            "newForm.fixedFields.category_id": "$scope.vars.activeId",
          },
        },
      ],
      stores: [
        {
          type: "entityStore",
          name: "categories",
          entityCode: "BaseMaterialCategory",
          properties: ["id", "code", "name", "parent", "orderNum"],
          orderBy: [
            {
              field: "orderNum",
            },
          ],
        },
      ],
    },
  ],
};

export default page;
