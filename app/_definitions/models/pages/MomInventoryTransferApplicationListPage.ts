import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    // {
    //   type: "auto",
    //   code: "code",
    // },
    {
      type: "auto",
      code: "operationType",
      hidden: true,
    },
    {
      type: "auto",
      code: "businessType",
      required: true,
      formControlProps: {
        requestParams: {
          fixedFilters: [
            {
              field: "operationType",
              operator: "in",
              value: ["transfer"],
              itemType: "text",
            },
          ],
        },
      },
    },
    {
      type: "auto",
      code: "applicant",
    },
    {
      type: "auto",
      code: "from",
      required: true,
      formControlProps: {
        requestParams: {
          fixedFilters: [
            {
              field: "type",
              operator: "eq",
              value: "warehouse",
            },
          ],
        },
      },
    },
    {
      type: "auto",
      code: "to",
      required: true,
      formControlProps: {
        requestParams: {
          fixedFilters: [
            {
              field: "type",
              operator: "eq",
              value: "warehouse",
            },
          ],
        },
      },
    },
    // {
    //   type: "auto",
    //   code: "operationState",
    // },
  ],
  defaultFormFields: {
    state: "approved",
    operationState: "pending",
  },
  onValuesChange: [
    {
      $action: "script",
      script: `
        const changedValues = event.args[0] || {};
        if(changedValues.hasOwnProperty('businessType')) {
          const _ = event.framework.getExpressionVars()._;
          const businessTypeItems = _.get(event.scope.stores['dataFormItemList-businessType'], 'data.list');
          const businessTypeItem = _.find(businessTypeItems, function (item) { return item.id == changedValues.businessType });

          event.page.sendComponentMessage(event.sender.$id, {
            name: "setFieldsValue",
            payload: {
              operationType: _.get(businessTypeItem, "operationType"),
            }
          });
        }
      `,
    },
  ],
};

const page: RapidPage = {
  code: "mom_inventory_transfer_application_list",
  name: "库存调拨申请",
  title: "库存调拨申请",
  permissionCheck: { any: [] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomInventoryApplication",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
          $permissionCheck: "inventoryApplication.manage",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          formControlProps: {
            style: { width: 360 },
          },
          placeholder: "搜索申请单号、物料（名称、编号、规格）",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: [
            "code",
            {
              field: "items",
              operator: "exists",
              filters: [
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
        },
      ],
      searchForm: {
        entityCode: "MomInventoryApplication",
        items: [
          {
            type: "auto",
            code: "applicant",
            filterMode: "in",
            filterFields: ["applicant_id"],
          },
          {
            type: "dateRange",
            code: "createdAt",
            filterMode: "range",
            filterExtra: {
              rangeUnit: "day",
            },
          },
          {
            type: "auto",
            code: "operationState",
            filterMode: "in",
            itemType: "text",
          },
        ],
      },
      fixedFilters: [
        {
          operator: "eq",
          field: "operationType",
          value: "transfer",
        },
      ],
      orderBy: [
        {
          field: "createdAt",
          desc: true,
        },
      ],
      pageSize: 20,
      extraProperties: ["operationType", "items"],
      columns: [
        {
          type: "link",
          code: "code",
          // rendererType: 'rapidLinkRenderer',
          rendererProps: {
            url: "/pages/mom_inventory_transfer_application_details?id={{id}}",
          },
          width: "200px",
        },
        // {
        //   type: "auto",
        //   code: "operationType",
        //   width: "150px",
        // },
        {
          type: "auto",
          code: "businessType",
          width: "150px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "from",
          width: "150px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "to",
          width: "150px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "applicant",
          width: "150px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
        // {
        //   type: "auto",
        //   code: "state",
        //   width: "150px",
        // },
        // {
        //   type: "auto",
        //   code: "operationState",
        //   width: "150px",
        // },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
          $permissionCheck: "inventoryApplication.manage",
          $exps: {
            disabled: "$slot.record.operationState !== 'pending'",
            _hidden:
              "!$slot.record?.businessType?.businessTypeRoles?.find((item) => item.name === 'editor')?.businessTypeRoles.map((item) => item.id).some(id => me?.profile?.roles?.map(r => r.id).includes(id))",
          },
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "MomInventoryApplication",
          $permissionCheck: "inventoryApplication.manage",
          $exps: {
            disabled: "$slot.record.operationState !== 'pending'",
            _hidden:
              "!$slot.record?.businessType?.businessTypeRoles?.find((item) => item.name === 'delete')?.businessTypeRoles.map((item) => item.id).some(id => me?.profile?.roles?.map(r => r.id).includes(id))",
          },
        },
        // {
        //   $type: "rapidTableAction",
        //   code: "dispatch",
        //   actionText: "下发",
        //   $permissionCheck: "inventoryApplication.manage",
        //   $exps: {
        //     disabled: "$slot.record.operationState !== 'pending' || $slot.record.operationType !== 'in'",
        //   },
        //   onAction: [
        //     {
        //       $action: "sendHttpRequest",
        //       method: "POST",
        //       url: "/api/mom/mom_inventory_operations",
        //       data: {
        //         state: "processing",
        //         approvalState: "uninitiated",
        //       },
        //       $exps: {
        //         "data.application": "$event.args[0].id",
        //         "data.businessType": "$event.args[0].businessType.id",
        //         "data.operationType": "$event.args[0].businessType.operationType",
        //       },
        //     },
        //     {
        //       $action: "antdMessage",
        //       title: "单据下发成功。",
        //       onClose: [
        //         {
        //           $action: "loadScopeData",
        //         },
        //       ],
        //     },
        //   ],
        // },
      ],
      relations: {
        items: {
          properties: ["id", "material", "lotNum", "quantity", "unit", "remark"],
        },
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
      expandedRow: {
        $type: "rapidEntityList",
        entityCode: "MomInventoryApplicationItem",
        dataSourceType: "dataSource",
        viewMode: "table",
        selectionMode: "none",
        pageSize: -1,
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
          {
            type: "auto",
            code: "remark",
          },
        ],
        $exps: {
          dataSource: "_.get($slot.record, 'items')",
        },
      },
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      $exps: {
        "newForm.fixedFields.state": "'approved'",
        "newForm.fixedFields.operationState": "'pending'",
      },
    },
  ],
};

export default page;
