import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "code",
    },
    {
      type: "auto",
      code: "applicant",
      required: true,
      formControlProps: {
        $exps: {
          disabled: "true",
        },
      },
    },
    {
      type: "auto",
      code: "orderNumb",
      required: true,
    },
    {
      type: "auto",
      code: "supplier",
      required: true,
    },
    // {
    //   type: "auto",
    //   code: "state",
    // },
    // {
    //   type: "auto",
    //   code: "approvalState",
    // },
  ],
  defaultFormFields: {
    state: "processing",
    applicant: "",
    approvalState: "uninitiated",
  },
};

const page: RapidPage = {
  code: "mom_transport_operation_list",
  name: "运输单列表",
  title: "运输单列表",
  // permissionCheck: { any: ["inspectionTransport.manage"] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomTransportOperation",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
          $permissionCheck: "inspectionTransport.manage",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索编号",
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
      columns: [
        {
          type: "link",
          code: "code",
          rendererType: "rapidLinkRenderer",
          rendererProps: {
            url: "/pages/mom_transport_operation_details?id={{id}}",
          },
          width: "150px",
        },
        {
          type: "auto",
          code: "orderNum",
          width: "150px",
        },
        {
          type: "auto",
          code: "supplier",
          width: "150px",
        },
        {
          type: "auto",
          code: "createdAt",
          width: "150px",
        },
        {
          type: "auto",
          code: "state",
          width: "100px",
        },
        {
          type: "auto",
          code: "approvalState",
          width: "100px",
        },
      ],
      actions: [
        {
          $type: "sonicRecordActionEditEntity",
          code: "edit",
          actionType: "edit",
          actionText: "修改",
          $permissionCheck: "inspectionTransport.manage",
          $exps: {
            disabled: "$slot.record.approvalState !== 'uninitiated'",
          },
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "MomTransportOperation",
          $permissionCheck: "inspectionTransport.manage",
          $exps: {
            disabled: "$slot.record.approvalState !== 'uninitiated'",
          },
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      $exps: {
        "newForm.defaultFormFields.applicant": "me.profile.id",
        "newForm.fixedFields.state": "'processing'",
        "newForm.fixedFields.approvalState": "'uninitiated'",
      },
    },
  ],
};

export default page;
