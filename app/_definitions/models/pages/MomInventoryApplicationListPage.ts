import { cloneDeep, multiply } from "lodash";
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
              value: ["in", "out"],
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
      code: "depositDate",
      $exps: {
        _hidden: "$self.form.getFieldValue('operationType') === 'in'",
      },
    },
    {
      type: "auto",
      code: "biller",
      required: true,
    },
    {
      type: "auto",
      label: "发料",
      code: "fFManager",
      required: true,
      $exps: {
        label: "$functions.renderInventoryManagerDisplayLabel($self.form.getFieldValue('businessType').name, 'fFManager')",
      },
    },
    {
      type: "auto",
      code: "fSManager",
      label: "领料",
      required: true,
      $exps: {
        label: "$functions.renderInventoryManagerDisplayLabel($self.form.getFieldValue('businessType').name, 'fSManager')",
      },
    },
    {
      type: "auto",
      code: "department",
      formControlProps: {
        listFilterFields: ["code", "name"],
        columns: [
          { title: "编码", code: "code", width: "100px" },
          { title: "名称", code: "name" },
        ],
        requestConfig: {
          url: "/app/oc_departments/operations/find",
          method: "post",
          params: { orderBy: [{ field: "code" }] },
        },
      },
      $exps: {
        label: `(['其它原因出库', '其它原因出库退货入库', '领料出库', '生产退料入库'].includes($self.form.getFieldValue('businessType')?.name)) ? '领料部门' : 
               (['其它原因入库', '采购入库', '采购退货出库'].includes($self.form.getFieldValue('businessType')?.name)) ? '部门' :
               (['生产入库', '生产入库退货出库'].includes($self.form.getFieldValue('businessType')?.name)) ? '交货部门' : '部门'`,
        _hidden: `!(['其它原因出库', '其它原因出库退货入库', '领料出库', '生产退料入库',
                    '其它原因入库', '采购入库', '采购退货出库',
                    '生产入库', '生产入库退货出库'].includes($self.form.getFieldValue('businessType')?.name))`,
      },
    },
    {
      type: "auto",
      code: "supplier",
      label: "加工单位",
      $exps: {
        _hidden: `!(['委外加工出库', '委外加工出库退货入库', '委外加工入库'].includes($self.form.getFieldValue('businessType')?.name))`,
      },
    },
    {
      type: "auto",
      code: "fUse",
      label: "领料用途",
      $exps: {
        label: "['委外加工出库', '委外加工出库退货入库'].includes($self.form.getFieldValue('businessType')?.name) ? '加工要求' : '领料用途'",
        _hidden: `!(['领料出库', '生产退料入库','委外加工出库', '委外加工出库退货入库','其它原因出库', '其它原因出库退货入库', ].includes($self.form.getFieldValue('businessType')?.name))`,
      },
    },
    {
      type: "auto",
      code: "contractNum",
      label: "合同单号",
      $exps: {
        _hidden: "$self.form.getFieldValue('businessType')?.name !== '销售出库'",
      },
    },
    {
      type: "auto",
      code: "fPlanSn",
      label: "生产计划单编号",
      $exps: {
        _hidden: "!['领料出库','生产退料入库'].includes($self.form.getFieldValue('businessType')?.name)",
      },
    },
    {
      type: "auto",
      code: "express",
      label: "物流公司",
      $exps: {
        _hidden: "$self.form.getFieldValue('businessType')?.name !== '销售出库'",
      },
      formControlProps: {
        requestParams: {
          fixedFilters: [
            {
              field: "categories",
              operator: "exists",
              filters: [{ field: "code", operator: "eq", value: "express_supplier" }],
            },
          ],
        },
      },
    },
    {
      type: "auto",
      code: "fDeliveryCode",
      label: "销售发货单号",
      $exps: {
        _hidden: "$self.form.getFieldValue('businessType')?.name !== '销售出库'",
      },
    },
    {
      type: "auto",
      code: "from",
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
      $exps: {
        _hidden: "$self.form.getFieldValue('operationType') !== 'out'",
      },
    },
    {
      type: "auto",
      code: "to",
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
      $exps: {
        _hidden: "$self.form.getFieldValue('operationType') !== 'in'",
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
    source: "manual",
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
  code: "mom_inventory_application_list",
  name: "库存业务申请",
  title: "库存业务申请",
  permissionCheck: { any: [] },
  view: [
    {
      $id: "inventoryApplicationList",
      $type: "sonicEntityList",
      entityCode: "MomInventoryApplication",
      viewMode: "table",
      selectionMode: "none",
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
            code: "acceptQuantity",
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
          "columns[3].title": "_.get($slot.record, 'operationType') === 'in' ? '入库数量' : _.get($slot.record, 'operationType') === 'out' ? '出库数量' : ''",
          dataSource: "_.get($slot.record, 'items')",
        },
      },
      listActions: [
        {
          $type: "antdButton",
          icon: {
            $type: "antdIcon",
            name: "PlusOutlined",
          },
          type: "primary",
          href: `/pages/mom_inventory_application_form`,
          children: [
            {
              $type: "text",
              text: " 新建",
            },
          ],
          $permissionCheck: "inventoryApplication.manage",
        },
        {
          $type: "antdButton",
          href: `/api/app/exportExcel?type=application`,
          $exps: {
            href: "'/api/app/exportExcel?type=application&'+ qs.stringify({businessType: $scope.vars.businessType, applicant: $scope.vars.applicant, createdAt: $functions.formatMomentDate($scope.vars.createdAt), endAt: $functions.formatMomentDate($scope.vars.endAt), operationState: $scope.vars.operationState, material: $scope.vars.material, lotNum: $scope.vars.lotNum, biller: $scope.vars.biller, warehouse: $scope.vars.warehouse})",
            //'businessType=' + $scope.vars.businessType + '&applicant=' + $scope.vars.applicant + '&createdAt=' + $scope.vars.createdAt + '&endAt=' + $scope.vars.endAt + '&operationState=' + $scope.vars.operationState + '&material=' + $scope.vars.material + '&lotNum=' + $scope.vars.lotNum + '&biller=' + $scope.vars.biller + '&warehouse=' + $scope.vars.warehouse",
          },
          children: [
            {
              $type: "text",
              text: " 下载",
            },
          ],
        },
      ],
      relations: {
        items: {
          properties: ["id", "material", "lotNum", "quantity", "unit", "remark", "good", "lot", "acceptQuantity"],
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
      extraProperties: ["operationType", "items", "to", "from", "lots"],
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
      enabledFilterCache: true,
      filterCacheName: "mom_inventory_application_list",
      searchForm: {
        $id: "inventoryApplicationList-searchForm",
        entityCode: "MomInventoryApplication",
        formDataAdapter: `
          const createdAt = _.get(data, "createdAt");
          if(_.isArray(createdAt) && !_.isEmpty(createdAt)){
            return {
              ...data,
              createdAt: createdAt.map(function(v){
                return v ? moment(v) : v;
              })
            }
          }

          return data;
        `,
        items: [
          {
            type: "auto",
            code: "code",
            filterMode: "contains",
          },
          {
            type: "auto",
            label: "物品",
            code: "material",
            formControlType: "rapidTableSelect",
            formControlProps: {
              allowClear: true,
              dropdownMatchSelectWidth: 500,
              multiply: false,
              listTextFormat: "{{code}} {{name}}（{{specification}}）",
              listValueFieldName: "id",
              listFilterFields: ["name", "code", "specification"],
              searchPlaceholder: "搜索物料编码、 名称、 规格",
              columns: [
                {
                  title: "物品",
                  code: "material",
                  format: "{{code}} {{name}}（{{specification}}）",
                  width: 260,
                },
              ],
              requestConfig: {
                url: `/app/base_materials/operations/find`,
                params: {
                  properties: ["id", "name", "code", "specification"],
                },
              },
              onSelectedRecord: [
                {
                  $action: "script",
                  script: `
                  const info = event.args || {};
                  event.page.sendComponentMessage(event.sender.$id, {
                    name: "setFieldsValue",
                    payload: {
                       material: info[0]?.id,
                    }
                  });
                `,
                },
              ],
            },
            filterFields: [
              {
                field: "items",
                operator: "exists",
                filters: [
                  {
                    field: "material",
                    operator: "exists",
                    filters: [
                      {
                        field: "id",
                        operator: "eq",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "auto",
            label: "批号",
            code: "lot",
            formControlType: "rapidTableSelect",
            formControlProps: {
              allowClear: true,
              dropdownMatchSelectWidth: 500,
              multiply: false,
              listTextFormat: "{{lotNum}}",
              listValueFieldName: "lotNum",
              listFilterFields: ["lotNum"],
              searchPlaceholder: "搜索批号",
              columns: [
                {
                  title: "批号",
                  code: "lotNum",
                  format: "{{lotNum}}",
                  width: 260,
                },
              ],
              requestConfig: {
                url: `/app/base_lots/operations/find`,
                params: {
                  properties: ["id", "lotNum"],
                },
              },
              onSelectedRecord: [
                {
                  $action: "script",
                  script: `
                  const info = event.args || {};
                  event.page.sendComponentMessage(event.sender.$id, {
                    name: "setFieldsValue",
                    payload: {
                       lotNum: info[0]?.lotNum,
                    }
                  });
                `,
                },
              ],
            },
            filterFields: [
              {
                field: "items",
                operator: "exists",
                filters: [
                  {
                    field: "lotNum",
                    operator: "contains",
                  },
                ],
              },
            ],
          },
          {
            type: "auto",
            label: "仓库",
            code: "to",
            formControlType: "rapidTableSelect",
            formControlProps: {
              allowClear: true,
              dropdownMatchSelectWidth: 500,
              multiply: false,
              listTextFormat: "{{name}}",
              listValueFieldName: "id",
              listFilterFields: ["name"],
              searchPlaceholder: "搜索仓库",
              columns: [
                {
                  title: "仓库",
                  code: "name",
                  format: "{{name}}",
                  width: 260,
                },
              ],
              requestConfig: {
                url: `/app/base_locations/operations/find`,
                params: {
                  fixedFilters: [
                    {
                      operator: "and",
                      filters: [
                        {
                          field: "type",
                          operator: "eq",
                          value: "warehouse",
                        },
                      ],
                    },
                  ],
                  orderBy: [
                    {
                      field: "orderNum",
                    },
                  ],
                  properties: ["id", "code", "name", "orderNum"],
                  pagination: {
                    limit: 20,
                    offset: 0,
                  },
                },
              },
              onSelectedRecord: [
                {
                  $action: "script",
                  script: `
                  const info = event.args || {};
                  event.page.sendComponentMessage(event.sender.$id, {
                    name: "setFieldsValue",
                    payload: {
                       to: info[0]?.id,
                    }
                  });
                `,
                },
              ],
            },
            filterFields: [
              {
                operator: "or",
                filters: [
                  {
                    field: "from_warehouse_id",
                    operator: "eq",
                  },
                  {
                    field: "to_warehouse_id",
                    operator: "eq",
                  },
                ],
              },
            ],
          },
          // {
          //   type: "auto",
          //   label: "批号",
          //   code: "lot",
          //   formControlProps: {
          //     allowClear: true,
          //   },
          //   filterFields: [
          //     {
          //       field: "items",
          //       operator: "exists",
          //       filters: [
          //         {
          //           field: "lotNum",
          //           operator: "eq",
          //           value: "",
          //         },
          //       ],
          //     },
          //   ],
          // },
          // {
          //   type: "auto",
          //   code: "to",
          //   label: "仓库",
          //   requestConfig: {
          //     url: `/app/base_locations/operations/find`,
          //     params: {
          //       fixedFilters: [
          //         {
          //           operator: "and",
          //           filters: [
          //             {
          //               field: "type",
          //               operator: "eq",
          //               value: "warehouse",
          //             },
          //           ],
          //         },
          //       ],
          //       orderBy: [
          //         {
          //           field: "orderNum",
          //         },
          //       ],
          //       properties: ["id", "code", "name", "orderNum"],
          //       pagination: {
          //         limit: 20,
          //         offset: 0,
          //       },
          //     },
          //   },
          //   filterFields: [
          //     {
          //       field: "type",
          //       operator: "eq",
          //       value: "warehouse",
          //     },
          //     {
          //       field: "to",
          //       operator: "exists",
          //       filters: [
          //         {
          //           field: "id",
          //           operator: "eq",
          //           value: "",
          //         },
          //       ],
          //     },
          //   ],
          // },
          {
            type: "auto",
            code: "businessType",
            filterMode: "in",
            filterFields: ["business_id"],
          },
          {
            type: "auto",
            code: "applicant",
            filterMode: "in",
            filterFields: ["applicant_id"],
          },
          {
            type: "auto",
            code: "biller",
            filterMode: "in",
            filterFields: ["biller_id"],
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
        onValuesChange: [
          {
            $action: "script",
            script: `
              const changedValues = event.args[0] || {};

              if(changedValues.hasOwnProperty('material')){
                event.scope.setVars({
                  material: changedValues?.material,
                }, true);
              }

              if(changedValues.hasOwnProperty('lot')){
                event.scope.setVars({
                  lotNum: changedValues?.lot,
                }, true);
              }

               if(changedValues.hasOwnProperty('to')){
                event.scope.setVars({
                  warehouse: changedValues?.to,
                }, true);
              }

              if(changedValues.hasOwnProperty('businessType')){
                event.scope.setVars({
                  businessType: changedValues?.businessType,
                }, true);
              }
              if(changedValues.hasOwnProperty('applicant')){
                event.scope.setVars({
                  applicant: changedValues?.applicant,
                }, true);
              }

              if(changedValues.hasOwnProperty('biller')){
                event.scope.setVars({
                  biller: changedValues?.biller,
                }, true);
              }


              if(changedValues.hasOwnProperty('createdAt')){
                event.scope.setVars({
                  createdAt: changedValues?.createdAt[0],
                  endAt: changedValues?.createdAt[1],
                }, true);
              }
              if(changedValues.hasOwnProperty('operationState')){
                event.scope.setVars({
                  operationState: changedValues?.operationState,
                }, true);
              }
            `,
          },
        ],
        onSearch: [
          {
            $action: "script",
            script: `
              event.scope.setVars({
                searchText: event.args[0],
              }, true);
            `,
          },
        ],
      },
      fixedFilters: [
        {
          operator: "or",
          filters: [
            {
              operator: "eq",
              field: "operationType",
              value: "in",
            },
            {
              operator: "eq",
              field: "operationType",
              value: "out",
            },
          ],
        },
        {
          field: "businessType",
          operator: "exists",
          filters: [
            {
              field: "name",
              operator: "notIn",
              value: ["入库调整单", "出库调整单"],
              itemType: "text",
            },
          ],
        },
      ],
      orderBy: [
        {
          field: "createdAt",
          desc: true,
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "link",
          code: "code",
          // rendererType: 'rapidLinkRenderer',
          rendererProps: {
            url: "/pages/mom_inventory_application_details?id={{id}}&operationType={{operationType}}",
          },
          width: "200px",
        },
        {
          type: "auto",
          code: "warehouse",
          title: "仓库",
          width: "120px",
          rendererType: "text",
          rendererProps: {
            $exps: {
              text: "_.get($slot.record, 'to.name') || _.get($slot.record, 'from.name')",
            },
          },
        },
        {
          type: "auto",
          code: "source",
          width: "120px",
        },
        // {
        //   type: "auto",
        //   code: "operationType",
        //   width: "150px",
        // },
        {
          type: "auto",
          code: "businessType",
          width: "160px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        // {
        //   type: "auto",
        //   code: "from",
        //   width: "150px",
        //   rendererProps: {
        //     format: "{{name}}",
        //   },
        // },
        // {
        //   type: "auto",
        //   code: "to",
        //   width: "150px",
        //   rendererProps: {
        //     format: "{{name}}",
        //   },
        // },
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
          code: "biller",
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
        {
          type: "auto",
          code: "operationState",
          width: "150px",
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
          $permissionCheck: "inventoryApplication.manage",
          $exps: {
            _hidden:
              "!$slot.record?.businessType?.businessTypeRoles?.find((item) => item.code === 'editor')?.businessTypeRoles.map((item) => item.id).some(id => me?.profile?.roles?.map(r => r.id).includes(id))",
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
              "!$slot.record?.businessType?.businessTypeRoles?.find((item) => item.code === 'delete')?.businessTypeRoles.map((item) => item.id).some(id => me?.profile?.roles?.map(r => r.id).includes(id))",
          },
        },
        {
          $type: "rapidTableAction",
          code: "dispatch",
          actionText: "下发",
          $permissionCheck: "inventoryApplication.manage",
          $exps: {
            disabled: "($slot.record.operationState !== 'pending' || $slot.record.operationType !== 'in')",
            // _hidden:
            //   "!$slot.record?.businessType?.businessTypeRoles?.find((item) => item.name === '下发')?.businessTypeRoles.map((item) => item.id).some(id => me?.profile?.roles?.map(r => r.id).includes(id))",
          },
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "POST",
              url: "/api/mom/mom_inventory_operations",
              data: {
                state: "processing",
                approvalState: "uninitiated",
              },
              $exps: {
                "data.application": "$event.args[0].id",
                "data.businessType": "$event.args[0].businessType.id",
                "data.operationType": "$event.args[0].businessType.operationType",
              },
            },
            {
              $action: "antdMessage",
              title: "单据下发成功。",
              onClose: [
                {
                  $action: "loadScopeData",
                },
              ],
            },
          ],
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      $exps: {
        "newForm.fixedFields.state": "'approved'",
        "newForm.fixedFields.operationState": "'pending'",
        "newForm.fixedFields.source": "'manual'",
      },
    },
  ],
};

export default page;
