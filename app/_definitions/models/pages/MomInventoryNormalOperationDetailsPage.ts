import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "material",
      listDataFindOptions: {
        properties: ["id", "code", "name", "specification", "defaultUnit"],
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
    {
      type: "auto",
      code: "tags",
    },
    {
      type: "auto",
      code: "quantity",
    },
    {
      type: "auto",
      code: "unit",
    },
    {
      type: "treeSelect",
      code: "from",
      formControlProps: {
        listDataSourceCode: "locations",
        listParentField: "parent.id",
      },
    },
    {
      type: "treeSelect",
      code: "to",
      formControlProps: {
        listDataSourceCode: "locations",
        listParentField: "parent.id",
      },
    },
    {
      type: "auto",
      code: "transferTime",
    },
  ],
  onValuesChange: [
    {
      $action: "script",
      script: `
        const changedValues = event.args[0] || {};
        if(changedValues.hasOwnProperty('material')) {
          const _ = event.framework.getExpressionVars()._;
          const materials = _.get(event.scope.stores['dataFormItemList-material'], 'data.list');
          const material = _.find(materials, function (item) { return item.id == changedValues.material });
          const unitId = _.get(material, 'defaultUnit.id');
          event.page.sendComponentMessage(event.sender.$id, {
            name: "setFieldsValue",
            payload: {
              unit: unitId,
            }
          });
        }
      `,
    },
  ],
};

const page: RapidPage = {
  code: "mom_inventory_normal_operation_details",
  parentCode: "mom_inventory_normal_operation_list",
  name: "库存操作详情",
  title: "库存操作详情",
  // permissionCheck: {any: []},
  view: [
    {
      $type: "rapidEntityForm",
      entityCode: "MomInventoryOperation",
      mode: "view",
      column: 3,
      extraProperties: ["application"],
      items: [
        {
          type: "auto",
          code: "code",
        },
        {
          type: "auto",
          code: "operationType",
        },
        {
          type: "auto",
          code: "businessType",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "createdAt",
        },
        {
          type: "auto",
          code: "state",
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    },
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
          pageSize: 100,
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
            {
              type: "auto",
              code: "tags",
              width: "100px",
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
              listActions: [
                {
                  $type: "sonicToolbarNewEntityButton",
                  text: "新建",
                  icon: "PlusOutlined",
                  actionStyle: "primary",
                  $permissionCheck: "inventoryOperation.manage",
                  $exps: {
                    _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'state') !== 'processing'",
                  },
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
                  field: "createdAt",
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
                  width: "100px",
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
                {
                  type: "auto",
                  code: "tags",
                  width: "100px",
                },
                // {
                //   type: "auto",
                //   code: "palletNum",
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
                {
                  type: "auto",
                  code: "from",
                  width: "150px",
                },
                {
                  type: "auto",
                  code: "to",
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
                },
                {
                  $type: "sonicRecordActionDeleteEntity",
                  code: "delete",
                  actionType: "delete",
                  actionText: "删除",
                  dataSourceCode: "list",
                  entityCode: "MomGoodTransfer",
                  $permissionCheck: "inventoryOperation.manage",
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
                hideActionsColumn: "_.get(_.first(_.get($stores.detail, 'data.list')), 'state') !== 'processing'",
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.operation_id": "$rui.parseQuery().id",
              },
            },
          ],
        },
      ],
    },
    {
      $type: "sectionSeparator",
      showLine: false,
    },
    {
      $type: "rapidToolbar",
      items: [
        {
          $type: "rapidToolbarButton",
          text: "确认提交",
          actionStyle: "primary",
          size: "large",
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              data: { state: "done", approvalState: "approving" },
              $exps: {
                url: `"/api/mom/mom_inventory_operations/" + $rui.parseQuery().id`,
              },
            },
          ],
          $exps: {
            _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'state') !== 'processing'",
          },
        },
        {
          $type: "rapidToolbarButton",
          text: "批准",
          actionStyle: "primary",
          size: "large",
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              data: { approvalState: "approved" },
              $exps: {
                url: `"/api/mom/mom_inventory_operations/" + $rui.parseQuery().id`,
              },
            },
          ],
          $exps: {
            _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'approvalState') !== 'approving'",
          },
        },
        {
          $type: "rapidToolbarButton",
          text: "拒绝",
          danger: true,
          size: "large",
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              data: { approvalState: "rejected" },
              $exps: {
                url: `"/api/mom/mom_inventory_operations/" + $rui.parseQuery().id`,
              },
            },
          ],
          $exps: {
            _hidden: "_.get(_.first(_.get($stores.detail, 'data.list')), 'approvalState') !== 'approving'",
          },
        },
      ],
    },
  ],
};

export default page;
