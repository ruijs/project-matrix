import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "factory",
      label: "工厂名称"
    },
    {
      type: "auto",
      code: "category",
      label: "设备类型"
    },
    {
      type: "auto",
      code: "manufacturer",
    },
    {
      type: "auto",
      code: "model",
    },
    {
      type: "auto",
      code: "code",
      label: "设备编号"
    },
    {
      type: "auto",
      code: "name",
      label: "设备名称"
    },
    {
      type: "auto",
      code: "state",
    },
    {
      type: "auto",
      code: "machine",
    },
  ],
};

const page: RapidPage = {
  code: "mom_equipment_list",
  name: "设备建模列表",
  title: "设备建模",
  // permissionCheck: {any: []},
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "MomEquipment",
      viewMode: "table",
      selectionMode: "none",
      listActions: [
        {
          $type: "sonicToolbarNewEntityButton",
          text: "新建",
          icon: "PlusOutlined",
          actionStyle: "primary",
        },
      ],
      extraActions: [
        {
          $type: "sonicToolbarFormItem",
          formItemType: "search",
          placeholder: "搜索名称、编码",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code", "name"],
        },
      ],
      fixedFilters: [
        // {
        //   field: "take_out_time",
        //   operator: "null",
        // },
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
          type: "auto",
          code: "code",
        },
        {
          type: "auto",
          code: "category",
          title: "设备类型",
        },
        {
          type: "auto",
          code: "name",
          title: "设备名称",
        },
        {
          type: "auto",
          code: "factory",
          title: "工厂名称",
        },
        {
          type: "auto",
          code: "manufacturer",
        },
        {
          type: "auto",
          code: "model",
        },
        {
          type: "auto",
          code: "state",
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
          entityCode: "MomEquipment",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
    },
  ],
};

export default page;
