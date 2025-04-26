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
      code: "application",
      listDataFindOptions: {
        properties: ["id", "operationType", "businessType", "code"],
      },
      formControlProps: {
        listTextFormat: "{{code}}",
        listFilterFields: ["code"],
        columns: [{ code: "code", title: "申请单号" }],
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
  ],
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
              operationType: _.get(applicationItem, "operationType"),
            }
          });
        }else if(changedValues.hasOwnProperty('businessType')){
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
  defaultFormFields: {
    state: "pending",
    approvalState: "uninitiated",
  },
};

const page: RapidPage = {
  code: "mom_inventory_check_operation_list",
  name: "库存盘点记录",
  title: "库存盘点记录",
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
          actionStyle: "primary",
          $permissionCheck: "inventoryOperation.manage",
        },
      ],
      relations: {
        businessType: {
          relations: {
            businessTypeRoles: true,
          },
        },
      },
      fixedFilters: [
        {
          operator: "eq",
          field: "operationType",
          value: "adjust",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索申请单号",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code"],
        },
      ],
      orderBy: [
        {
          field: "createdAt",
          desc: true,
        },
      ],
      pageSize: 20,
      extraProperties: ["operationType"],
      columns: [
        {
          type: "link",
          code: "code",
          rendererType: "rapidLinkRenderer",
          rendererProps: {
            url: "/pages/mom_inventory_check_operation_details?id={{id}}",
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
            url: "/pages/mom_inventory_adjust_application_details?id={{id}}",
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
            _hidden:
              "!$slot.record?.businessType?.businessTypeRoles?.find((item) => item.code === 'delete')?.businessTypeRoles.map((item) => item.id).some(id => me?.profile?.roles?.map(r => r.id).includes(id))",
          },
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      $exps: {
        "newForm.fixedFields.state": "'processing'",
        "newForm.fixedFields.approvalState": "'uninitiated'",
      },
    },
  ],
};

export default page;
