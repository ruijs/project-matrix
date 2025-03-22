import { cloneDeep, omit } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    // {
    //   type: "auto",
    //   code: "code",
    // },
    {
      type: "auto",
      code: "application",
      listDataFindOptions: {
        properties: ["id", "operationType", "businessType", "code"],
      },
      formControlProps: {
        listTextFormat: "{{code}}",
        listFilterFields: ["code"],
        columns: [
          {
            code: "code",
            title: "申请单号",
          },
        ],
      },
    },
    {
      type: "auto",
      code: "businessType",
    },
    {
      type: "auto",
      code: "operationType",
    },
    {
      type: "auto",
      code: "sourceType",
      hidden: true,
    },
    {
      type: "auto",
      code: "productionPlanSn",
      $exps: {
        _hidden: "!($self.form.getFieldValue('operationType') === 'out' && $self.form.getFieldValue('sourceType') === 'picking')",
      },
    },
    {
      type: "treeSelect",
      code: "department",
      formControlProps: {
        listDataSourceCode: "departments",
        listParentField: "parent.id",
      },
      $exps: {
        _hidden:
          "!(($self.form.getFieldValue('operationType') === 'out' && $self.form.getFieldValue('sourceType') === 'picking') || ($self.form.getFieldValue('operationType') === 'in' && $self.form.getFieldValue('sourceType') === 'selfMade'))",
      },
    },
    {
      type: "auto",
      code: "warehouse",
      label: "仓库",
      formControlProps: {
        columns: [
          { title: "编号", code: "code", width: "100px" },
          { title: "名称", code: "name" },
        ],
        requestParams: {
          fixedFilters: [
            {
              field: "type",
              operator: "eq",
              value: "warehouse",
            },
          ],
          orderBy: [{ field: "code" }],
        },
      },
    },
    {
      type: "auto",
      code: "shop",
      $exps: {
        _hidden:
          "!(($self.form.getFieldValue('operationType') === 'out' && $self.form.getFieldValue('sourceType') === 'picking') || ($self.form.getFieldValue('operationType') === 'in' && $self.form.getFieldValue('sourceType') === 'selfMade'))",
      },
    },
    {
      type: "auto",
      code: "finishedMaterial",
      formControlProps: {
        listSearchable: true,
        dropdownMatchSelectWidth: 500,
        labelRendererType: "materialLabelRenderer",
        listFilterFields: ["name", "code", "specification"],
        columns: [
          { code: "code", title: "编号", width: 120 },
          { code: "name", title: "名称", width: 120 },
          { code: "specification", title: "规格", width: 120 },
        ],
      },
      $exps: {
        _hidden: "!($self.form.getFieldValue('operationType') === 'out' && $self.form.getFieldValue('sourceType') === 'picking')",
      },
    },
  ],
  formDataAdapter: `
    return _.merge({}, data, {
      sourceType: _.get(data, "businessType.config.defaultSourceType"),
    });
`,
  onValuesChange: [
    {
      $action: "script",
      script: `
        const changedValues = event.args[0] || {};
        const _ = event.framework.getExpressionVars()._;
        if(changedValues.hasOwnProperty('application')) {
          const applicationItems = _.get(event.scope.stores['dataFormItemList-application'], 'data.list');
          const applicationItem = _.find(applicationItems, function (item) { return item.id == changedValues.application });

          event.page.sendComponentMessage(event.sender.$id, {
            name: "setFieldsValue",
            payload: {
              businessType: _.get(applicationItem, "businessType.id"),
              sourceType: _.get(applicationItem, "businessType.config.defaultSourceType"),
              operationType: _.get(applicationItem, "operationType"),
              finishedMaterial: undefined,
              productionPlanSn: undefined,
              department: undefined,
              warehouse: undefined,
              shop: undefined,
            }
          });
        }else if(changedValues.hasOwnProperty('businessType')){
          const businessTypeItems = _.get(event.scope.stores['dataFormItemList-businessType'], 'data.list');
          const businessTypeItem = _.find(businessTypeItems, function (item) { return item.id == changedValues.businessType });

          event.page.sendComponentMessage(event.sender.$id, {
            name: "setFieldsValue",
            payload: {
              operationType: _.get(businessTypeItem, "operationType"),
              sourceType: _.get(businessTypeItem, "config.defaultSourceType"),
              finishedMaterial: undefined,
              productionPlanSn: undefined,
              department: undefined,
              warehouse: undefined,
              shop: undefined,
            }
          });
        }
      `,
    },
  ],
  defaultFormFields: {
    state: "pending",
    approvalState: "uninitiated",
  },
};

const page: RapidPage = {
  code: "mom_inventory_operation_list",
  name: "库存操作记录",
  title: "库存操作",
  // permissionCheck: {any: []},
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomInventoryOperation",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          $permissionCheck: "inventoryOperation.manage",
          actionStyle: "primary",
        },
        {
          $type: "antdButton",
          href: `/api/app/exportExcel?type=operation`,
          children: [
            {
              $type: "text",
              text: " 下载",
            },
          ],
        },
        // {
        //   $type: "antdButton",
        //   icon: {
        //     $type: "antdIcon",
        //     name: "PlusOutlined",
        //   },
        //   type: "primary",
        //   href: `/pages/mom_inventory_operation_form`,
        //   children: [
        //     {
        //       $type: "text",
        //       text: " 新建",
        //     },
        //   ],
        //   $permissionCheck: "inventoryOperation.manage",
        // },
      ],
      fixedFilters: [
        {
          operator: "or",
          filters: [
            {
              field: "operationType",
              operator: "eq",
              value: "in",
            },
            {
              field: "operationType",
              operator: "eq",
              value: "out",
            },
          ],
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          formControlProps: {
            style: { width: 360 },
          },
          placeholder: "搜索操作单号、物料（名称、编号、规格）",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: [
            "code",
            {
              field: "transfers",
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
        entityCode: "MomInventoryOperation",
        items: [
          {
            type: "auto",
            code: "businessType",
            filterMode: "in",
            filterFields: ["business_id"],
          },
          {
            type: "dateRange",
            code: "createdAt",
            filterMode: "range",
            filterExtra: {
              rangeUnit: "day",
            },
          },
        ],
      },
      orderBy: [
        {
          field: "createdAt",
          desc: true,
        },
      ],
      pageSize: 20,
      extraProperties: ["operationType", "transfers", "state", "approvalState"],
      columns: [
        {
          type: "auto",
          code: "state",
          width: "100px",
        },
        {
          type: "link",
          code: "code",
          // rendererType: "rapidLinkRenderer",
          rendererProps: {
            url: "/pages/mom_inventory_operation_details?id={{id}}",
            $exps: {
              href: "(_.get($slot.record, 'operationType') === 'out' ? '/pages/mom_inventory_out_operation_details?id=' : '/pages/mom_inventory_in_operation_details?id=') + _.get($slot.record, 'id')",
            },
          },
          width: "150px",
        },
        {
          type: "auto",
          code: "application",
          width: "150px",
          rendererType: "rapidLinkRenderer",
          rendererProps: {
            text: "{{code}}",
            url: "/pages/mom_inventory_application_details?id={{id}}",
          },
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
        {
          type: "auto",
          title: "仓库",
          code: "warehouse",
          width: "150px",
          rendererProps: {
            format: "{{name}}",
          },
        },
        {
          type: "auto",
          title: "KIS单据编号",
          code: "externalCode",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
        // {
        //   type: "auto",
        //   code: "state",
        //   width: "100px",
        // },
        // {
        //   type: "auto",
        //   code: "approvalState",
        //   width: "100px",
        // },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
          $permissionCheck: "inventoryOperation.manage",
          $exps: {
            disabled: "$slot.record.state !== 'processing'",
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
          entityCode: "MomInventoryOperation",
          $permissionCheck: "inventoryOperation.manage",
          $exps: {
            disabled: "$slot.record.state !== 'processing'",
            _hidden:
              "!$slot.record?.businessType?.businessTypeRoles?.find((item) => item.code === 'delete')?.businessTypeRoles.map((item) => item.id).some(id => me?.profile?.roles?.map(r => r.id).includes(id))",
          },
        },
      ],
      relations: {
        transfers: {
          properties: ["id", "material", "lotNum", "quantity", "unit"],
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
        ],
        $exps: {
          dataSource: "_.get($slot.record, 'transfers')",
        },
      },
      newForm: cloneDeep({
        ...omit(formConfig, "formDataAdapter"),
        onSaveSuccess: [
          {
            $action: "script",
            script: `
              const data = event.args[0];
              location.href = location.origin + '/pages/mom_inventory_in_operation_details?id=' + data.id;
            `,
          },
        ],
      }),
      editForm: cloneDeep(formConfig),
      $exps: {
        "newForm.fixedFields.state": "'processing'",
        "newForm.fixedFields.approvalState": "'uninitiated'",
      },
      stores: [
        {
          type: "entityStore",
          name: "departments",
          entityCode: "OcDepartment",
          properties: ["id", "code", "name", "parent", "orderNum", "createdAt"],
          filters: [],
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
