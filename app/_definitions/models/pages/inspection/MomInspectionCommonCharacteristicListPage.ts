import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "orderNum",
    },
    {
      type: "auto",
      code: "name",
    },
    {
      type: "textarea",
      code: "description",
    },
    {
      type: "auto",
      code: "category",
    },
  ],
  defaultFormFields: {
    orderNum: 0,
  },
};

const page: RapidPage = {
  code: "mom_inspection_common_characteristic_list",
  name: "通用检验特征",
  title: "通用检验特征",
  permissionCheck: { any: ["inspectionCharacteristic.manage"] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomInspectionCommonCharacteristic",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
          $permissionCheck: "inspectionCharacteristic.manage",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索名称",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["name"],
        },
      ],
      fixedFilters: [
        {
          operator: "null",
          field: "deletedAt",
        },
      ],
      orderBy: [
        {
          field: "orderNum",
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "auto",
          code: "state",
          width: "80px",
        },
        {
          type: "auto",
          code: "orderNum",
          width: "80px",
        },
        {
          type: "auto",
          code: "name",
          width: "150px",
        },
        {
          type: "auto",
          code: "category",
          width: "150px",
        },
        {
          type: "auto",
          code: "description",
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
          $permissionCheck: "inspectionCharacteristic.manage",
        },
        {
          $type: "sonicRecordActionUpdateEntity",
          code: "disable",
          actionText: "禁用",
          entity: {
            state: "disabled",
          },
          $exps: {
            _hidden: "$slot.record.state !== 'enabled'",
          },
        },
        {
          $type: "sonicRecordActionUpdateEntity",
          code: "enable",
          actionText: "启用",
          entity: {
            state: "enabled",
          },
          $exps: {
            _hidden: "$slot.record.state === 'enabled'",
          },
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          $permissionCheck: "inspectionCharacteristic.manage",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      $exps: {
        "newForm.fixedFields.state": "'enabled'",
      },
    } satisfies SonicEntityListRockConfig,
  ],
};

export default page;
