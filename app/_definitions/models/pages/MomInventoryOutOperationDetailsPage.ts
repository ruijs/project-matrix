import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig, SonicEntityDetailsRockConfig } from "@ruiapp/rapid-extension";

const materialFormItemConfig: RapidEntityFormConfig["items"][0] = {
  type: "auto",
  label: "物品",
  code: "material",
  formControlType: "rapidTableSelect",
  formControlProps: {
    dropdownMatchSelectWidth: 500,
    listTextFormat: "{{material.code}}-{{material.name}}（{{material.specification}}）",
    listValueFieldName: "material.id",
    listFilterFields: ["material.specification", "lotNum"],
    searchPlaceholder: "搜索物料规格、批次号",
    columns: [
      {
        title: "物品",
        code: "material",
        format: "{{material.code}}-{{material.name}}（{{material.specification}}）",
        width: 260,
      },
      {
        title: "批次号",
        code: "lotNum",
        width: 180,
      },
    ],
    requestConfig: {
      url: `/mom/mom_inventory_application_items/operations/find`,
      params: {
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
        properties: ["id", "material", "lotNum", "unit"],
      },
    },
    onSelectedRecord: [
      {
        $action: "script",
        script: `
        const info = event.args[0] || {};

        const _ = event.framework.getExpressionVars()._;
        event.page.sendComponentMessage(event.sender.$id.replace('-item-material-input', ''), {
          name: "setFieldsValue",
          payload: {
            unit: _.get(info, 'unit.name'),
            lotNum: _.get(info, 'lotNum')
          }
        });
      `,
      },
    ],
  },
  $exps: {
    "formControlProps.requestConfig.params.fixedFilters[0].filters[0].value": "_.get(_.first(_.get($stores.detail, 'data.list')), 'application.id')",
  },
};

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    materialFormItemConfig,
    {
      type: "auto",
      code: "unit",
      formControlProps: {
        disabled: true,
      },
    },
    {
      type: "auto",
      code: "lotNum",
    },
    {
      type: "auto",
      code: "quantity",
    },
    {
      type: "auto",
      code: "packageNum",
    },
  ],
};

const page: RapidPage = {
  code: "mom_inventory_out_operation_details",
  //@ts-ignore
  parentCode: "mom_inventory_operation_list",
  name: "出库操作详情",
  title: "出库操作详情",
  // permissionCheck: {any: []},
  view: [
    {
      $type: "sonicEntityDetails",
      entityCode: "MomInventoryOperation",
      column: 3,
      titlePropertyCode: "code",
      statePropertyCode: "state",
      extraProperties: ["application"],
      items: [
        {
          code: "businessType",
        },
        {
          code: "warehouse",
          label: "仓库",
        },
        {
          code: "productionPlanSn",
          $exps: {
            _hidden: "!($stores.detail?.data?.list[0]?.businessType.name === '领料出库')",
          },
        },
        {
          code: "department",
          $exps: {
            _hidden: "!($stores.detail?.data?.list[0]?.businessType.name === '领料出库' || $stores.detail?.data?.list[0]?.businessType.name === '生产入库')",
          },
        },
        {
          code: "shop",
          $exps: {
            _hidden: "!($stores.detail?.data?.list[0]?.businessType.name === '领料出库' || $stores.detail?.data?.list[0]?.businessType.name === '生产入库')",
          },
        },
        {
          code: "finishedMaterial",
          $exps: {
            _hidden: "!($stores.detail?.data?.list[0]?.businessType.name === '领料出库')",
          },
        },
        {
          code: "createdAt",
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    } satisfies SonicEntityDetailsRockConfig,
    {
      $type: "box",
      children: [
        {
          $type: "sectionSeparator",
          showLine: true,
        },
        {
          $type: "htmlElement",
          htmlTag: "h2",
          children: [
            {
              $type: "text",
              text: "申请明细",
            },
          ],
        },
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
          pageSize: -1,
          orderBy: [
            {
              field: "orderNum",
            },
          ],
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
            {
              type: "auto",
              code: "lotNum",
              width: "180px",
            },
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
          $exps: {
            "fixedFilters[0].filters[0].value": "_.get(_.first(_.get($stores.detail, 'data.list')), 'application.id')",
          },
        },
      ],
      $exps: {
        _hidden: "!_.get(_.first(_.get($stores.detail, 'data.list')), 'application.id')",
      },
    },
    {
      $type: "sectionSeparator",
      showLine: false,
    },
    {
      $type: "antdTabs",
      items: [
        {
          key: "items",
          label: "库存操作明细",
          children: [
            {
              $id: "goodTransferList",
              $type: "sonicEntityList",
              entityCode: "MomGoodTransfer",
              viewMode: "table",
              selectionMode: "none",
              fixedFilters: [
                {
                  field: "operation",
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
              // listActions: [
              //   {
              //     $type: "sonicToolbarRefreshButton",
              //     text: "刷新",
              //     icon: "ReloadOutlined",
              //   },
              // ],
              pageSize: -1,
              orderBy: [
                {
                  field: "createdAt",
                },
              ],
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
                {
                  type: "auto",
                  code: "lotNum",
                  width: "160px",
                },
                {
                  type: "auto",
                  code: "binNum",
                  width: "160px",
                  title: "托盘号",
                },
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
                {
                  key: "qualityGuaranteePeriod",
                  type: "auto",
                  code: "material",
                  title: "保质期",
                  fieldName: "material.qualityGuaranteePeriod",
                },
                {
                  key: "manufactureDate",
                  type: "auto",
                  code: "good",
                  title: "生产日期",
                  fieldName: "good.manufactureDate",
                  fieldType: "date",
                },
                {
                  key: "validityDate",
                  type: "auto",
                  code: "good",
                  title: "有效期至",
                  fieldName: "good.validityDate",
                  fieldType: "date",
                },
                {
                  type: "auto",
                  code: "from",
                  width: "150px",
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
                  $permissionCheck: "inventoryOperation.manage",
                  $exps: {
                    _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'state') !== 'processing'",
                  },
                },
                {
                  $type: "sonicRecordActionDeleteEntity",
                  code: "delete",
                  actionType: "delete",
                  actionText: "删除",
                  dataSourceCode: "list",
                  entityCode: "MomGoodTransfer",
                  $permissionCheck: "inventoryOperation.manage",
                  $exps: {
                    _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'state') !== 'processing'",
                  },
                },
              ],
              newForm: cloneDeep(formConfig),
              editForm: cloneDeep(formConfig),
              stores: [
                {
                  type: "entityStore",
                  name: "locations",
                  entityCode: "BaseLocation",
                  properties: ["id", "type", "code", "name", "parent", "orderNum", "createdAt"],
                  filters: [],
                  orderBy: [
                    {
                      field: "orderNum",
                    },
                  ],
                },
              ],
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.operation_id": "$rui.parseQuery().id",
                "newForm.fixedFields.operationId": "$rui.parseQuery().id",
              },
            },
          ],
        },
        {
          key: "groups",
          label: "物品明细",
          children: [
            {
              $id: "goodTransferGroupList",
              $type: "businessTable",
              selectionMode: "none",
              dataSourceCode: "goodTransferGroupList",
              requestConfig: {
                url: "/api/app/listGoodOutTransfers",
              },
              $exps: {
                "fixedFilters[0].value": "$rui.parseQuery().id",
              },
              fixedFilters: [
                {
                  field: "operationId",
                  operator: "eq",
                  value: "",
                },
              ],
              requestParamsAdapter: `
                return {
                  operationId: _.get(params, "filters[0]filters[0]value"),
                  limit: 1000
                }
              `,
              responseDataAdapter: `
                return {
                  list: data || []
                }
              `,
              columns: [
                {
                  title: "物料编号",
                  type: "auto",
                  code: "material.code",
                },
                {
                  title: "物料名称",
                  type: "auto",
                  code: "material.name",
                },
                {
                  title: "规格型号",
                  type: "auto",
                  code: "material.specification",
                },
                {
                  title: "单位",
                  type: "auto",
                  code: "material.defaultUnit.name",
                },
                {
                  title: "出库数量",
                  type: "auto",
                  code: "completedAmount",
                },
                {
                  title: "出库托数",
                  type: "auto",
                  code: "completedPalletAmount",
                },
                {
                  title: "批号",
                  type: "auto",
                  code: "lotNum",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      $type: "sectionSeparator",
      showLine: false,
    },
    // {
    //   $type: "rapidToolbar",
    //   items: [
    //     {
    //       $type: "rapidToolbarButton",
    //       text: "批准",
    //       actionStyle: "primary",
    //       size: "large",
    //       onAction: [
    //         {
    //           $action: "sendHttpRequest",
    //           method: "PATCH",
    //           data: { approvalState: "approved" },
    //           $exps: {
    //             url: `"/api/mom/mom_inventory_operations/" + $rui.parseQuery().id`,
    //           },
    //         },
    //       ],
    //       $exps: {
    //         _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'approvalState') !== 'approving'",
    //       },
    //     },
    //     {
    //       $type: "rapidToolbarButton",
    //       text: "拒绝",
    //       danger: true,
    //       size: "large",
    //       onAction: [
    //         {
    //           $action: "sendHttpRequest",
    //           method: "PATCH",
    //           data: { approvalState: "rejected" },
    //           $exps: {
    //             url: `"/api/mom/mom_inventory_operations/" + $rui.parseQuery().id`,
    //           },
    //         },
    //       ],
    //       $exps: {
    //         _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'approvalState') !== 'approving'",
    //       },
    //     },
    //   ],
    // },
  ],
};

export default page;
