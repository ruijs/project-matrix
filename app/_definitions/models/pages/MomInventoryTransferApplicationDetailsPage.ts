import { cloneDeep, omit } from "lodash";
import type { RapidPage, RapidEntityFormConfig, SonicEntityDetailsRockConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "material",
      listDataFindOptions: {
        properties: ["id", "code", "name", "specification", "defaultUnit", "category"],
        keepNonPropertyFields: true,
      },
      formControlProps: {
        dropdownMatchSelectWidth: 500,
        labelRendererType: "materialLabelRenderer",
        listFilterFields: ["name", "code", "specification"],
        columns: [
          { code: "code", title: "编号", width: 120 },
          { code: "name", title: "名称", width: 120 },
          { code: "specification", title: "规格", width: 120 },
        ],
      },
    },
    {
      type: "auto",
      code: "lotNum",
      $exps: {
        _hidden:
          "_.get($page.scope.stores, 'detail.data.list[0].operationType') === 'out' ||  _.get($page.scope.stores, 'detail.data.list[0].operationType') === 'transfer'",
      },
    },
    {
      type: "auto",
      code: "lotNum",
      formControlType: "materialLotNumSelector",
      formControlProps: {},
      $exps: {
        _hidden: "_.get($page.scope.stores, 'detail.data.list[0].operationType') === 'in'",
        "formControlProps.materialId": "$self.form.getFieldValue('material')",
        "formControlProps.materialCategoryId": "$self.form.getFieldValue('materialCategoryId')",
        "formControlProps.businessTypeId": "_.get($page.scope.stores, 'detail.data.list[0].businessType.id')",
      },
    },
    // {
    //   type: "auto",
    //   code: "binNum",
    // },
    // {
    //   type: "auto",
    //   code: "serialNum",
    // },
    // {
    //   type: "auto",
    //   code: "trackingCode",
    // },
    // {
    //   type: "auto",
    //   code: "tags",
    // },
    {
      type: "auto",
      code: "quantity",
    },
    {
      type: "auto",
      code: "unit",
    },
  ],
  relations: {
    material: {
      properties: ["id", "code", "name", "specification", "category"],
      relations: {
        category: {
          properties: ["id", "code", "name", "printTemplate"],
        },
      },
    },
  },
  formDataAdapter: `
    return _.get(data, "material.category.id") ? _.merge(data, { materialCategoryId: _.get(data, "material.category.id") }) : data;
  `,
  onValuesChange: [
    {
      $action: "script",
      script: `
        const changedValues = event.args[0] || {};
        if(changedValues.hasOwnProperty('material')) {
          const _ = event.framework.getExpressionVars()._;
          const materials = _.get(event.scope.stores['dataFormItemList-material'], 'data.list');
          const material = _.find(materials, function (item) { return item.id == changedValues.material });
          event.page.sendComponentMessage(event.sender.$id, {
            name: "setFieldsValue",
            payload: {
              materialCategoryId: _.get(material, 'category.id'),
              unit: _.get(material, 'defaultUnit.id'),
              lotNum: ''
            }
          });
        }
      `,
    },
  ],
  customRequest: {
    method: "post",
    url: "/app/createInventoryApplicationItems",
  },
};

const page: RapidPage = {
  code: "mom_inventory_transfer_application_details",
  //@ts-ignore
  parentCode: "mom_inventory_transfer_application_list",
  name: "库存业务申请单详情",
  title: "库存业务申请单详情",
  // permissionCheck: {any: []},
  view: [
    {
      $type: "sonicEntityDetails",
      entityCode: "MomInventoryApplication",
      column: 3,
      extraProperties: ["from", "to", "operationState", "operationType"],
      titlePropertyCode: "code",
      statePropertyCode: "operationState",
      relations: {
        businessType: {
          relations: {
            businessTypeRoles: {
              relations: {
                businessTypeRoles: true,
              },
            },
          },
        },
      },
      items: [
        {
          code: "code",
        },
        {
          code: "operationType",
        },
        {
          code: "businessType",
        },
        {
          code: "createdAt",
        },
      ],
      actions: [
        {
          $type: "pagePrint",
          slots: [],
          orderBy: [{ field: "orderNum" }],
          relations: {
            lot: true,
            good: {
              properties: ["id", "location"],
              relations: {
                location: true,
              },
            },
          },
          properties: ["id", "material", "lotNum", "quantity", "unit", "quantity", "binNum", "lot", "good"],
          filters: [
            {
              operator: "and",
              filters: [{ field: "application", operator: "exists", filters: [{ field: "id", operator: "eq", value: "$rui.parseQuery().id" }] }],
            },
          ],
          columns: [
            { code: "material", name: "物品", isObject: true, value: "code", jointValue: "name", joinAnOtherValue: "specification" },
            { code: "lotNum", name: "批号" },
            {
              code: "binNum",
              name: "托盘号",
              columnRenderAdapter: `
                const binNumItems = _.filter(_.get(record, 'binNumItems'),function(item) { return !!_.get(item, "binNum") });
                return _.map(binNumItems,function(item){  
                  const binNum = _.get(item, "binNum") || '-';
                  const quantity = _.get(item, "quantity") || 0;
                  const location = _.get(item, "good.location.name") || '-';
                  return _.join([binNum, quantity, location], ' | ');
                });
              `,
            },
            { code: "quantity", name: "数量" },
            { code: "unit", name: "单位", isObject: true, value: "code" },
            { code: "remark", name: "备注" },
          ],
          $exps: {
            apiUrl: `'mom/mom_inventory_application_items/operations/find'`,
            "filters[0].filters[0].filters[0].value": "$rui.parseQuery().id",
          },
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    } satisfies SonicEntityDetailsRockConfig,

    {
      $type: "antdTabs",
      items: [
        {
          key: "items",
          label: "物品明细",
          children: [
            {
              $id: "applicationItemList",
              $type: "sonicEntityList",
              entityCode: "MomInventoryApplicationItem",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "application",
                  operator: "exists",
                  filters: [
                    {
                      field: "id",
                      operator: "eq",
                      value: "",
                    },
                  ],
                },
              ],
              listActions: [
                {
                  $type: "sonicToolbarNewEntityButton",
                  text: "新建",
                  icon: "PlusOutlined",
                  actionStyle: "primary",
                  $permissionCheck: "inventoryApplication.manage",
                },
                // {
                //   $type: "sonicToolbarRefreshButton",
                //   text: "刷新",
                //   icon: "ReloadOutlined",
                // },
              ],
              pageSize: 100,
              orderBy: [
                {
                  field: "orderNum",
                },
              ],
              columns: [
                // {
                //   type: 'auto',
                //   code: 'good',
                //   width: '100px',
                //   rendererProps: {
                //     format: "{{lotNum}} / {{serialNum}}",
                //   },
                // },
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
                {
                  type: "auto",
                  code: "lotNum",
                  width: "100px",
                },
                // {
                //   type: "auto",
                //   code: "binNum",
                //   width: "100px",
                // },
                // {
                //   type: "auto",
                //   code: "serialNum",
                //   width: "100px",
                // },
                // {
                //   type: "auto",
                //   code: "trackingCode",
                //   width: "100px",
                // },
                // {
                //   type: "auto",
                //   code: "tags",
                //   width: "100px",
                // },
                {
                  type: "auto",
                  code: "quantity",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "unit",
                  width: "80px",
                  rendererProps: {
                    format: "{{name}}",
                  },
                },
              ],
              actions: [
                {
                  $type: "sonicRecordActionEditEntity",
                  code: "edit",
                  actionType: "edit",
                  actionText: "修改",
                  // $permissionCheck: "inventoryApplication.manage",
                  $exps: {
                    _hidden: `!_.get(_.first(_.get($stores.detail, 'data.list')), 'businessType')?.businessTypeRoles?.find((item) => item.code === 'editorMaterial')?.businessTypeRoles.map((item) => item.id).some(id => me?.profile?.roles?.map(r => r.id).includes(id))`,
                  },
                },
                {
                  $type: "sonicRecordActionDeleteEntity",
                  code: "delete",
                  actionType: "delete",
                  actionText: "删除",
                  dataSourceCode: "list",
                  entityCode: "MomInventoryApplicationItem",
                  // $permissionCheck: "inventoryApplication.manage",
                  $exps: {
                    _hidden: `!_.get(_.first(_.get($stores.detail, 'data.list')), 'businessType')?.businessTypeRoles?.find((item) => item.code === 'deleteMaterial')?.businessTypeRoles.map((item) => item.id).some(id => me?.profile?.roles?.map(r => r.id).includes(id))`,
                  },
                },
              ],
              newForm: cloneDeep(omit(formConfig, ["relations", "formDataAdapter"])),
              editForm: cloneDeep(omit(formConfig, "customRequest")),
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.application": "$rui.parseQuery().id",
              },
            },
          ],
        },
      ],
    },
  ],
};

export default page;
