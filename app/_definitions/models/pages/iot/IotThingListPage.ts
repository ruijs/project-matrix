import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "type",
    },
    {
      type: "auto",
      code: "code",
    },
    {
      type: "textarea",
      code: "description",
    },
    {
      type: "auto",
      code: "gateway",
    },
    {
      type: "auto",
      code: "state",
    },
  ],
  defaultFormFields: {
    state: "enabled",
  },
};

const page: RapidPage = {
  code: "iot_thing_list",
  name: "物品列表",
  title: "物品管理",
  permissionCheck: { any: ["iot.manage"] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "IotThing",
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
          placeholder: "搜索编号、名称、描述",
          actionEventName: "onSearch",
          filterMode: "contains",
          filterFields: ["code", "name", "description"],
        },
      ],
      orderBy: [
        {
          field: "code",
        },
      ],
      pageSize: 20,
      columns: [
        {
          type: "auto",
          code: "state",
          width: "100px",
        },
        {
          type: "link",
          code: "code",
          fixed: "left",
          width: "200px",
          rendererProps: {
            url: "/pages/iot_thing_details?id={{id}}",
          },
        },
        {
          type: "auto",
          code: "type",
          width: "150px",
          rendererType: "rapidLinkRenderer",
          rendererProps: {
            url: "/pages/iot_type_details?id={{id}}",
            text: "{{name}}",
          },
        },
        {
          type: "auto",
          code: "accessToken",
          width: "300px",
        },
        {
          type: "auto",
          code: "gateway",
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
          actionText: "修改",
        },
        {
          $type: "rapidTableAction",
          code: "disable",
          actionText: "禁用",
          $exps: {
            _hidden: "$slot.record.state !== 'enabled'",
          },
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              data: { state: "disabled" },
              $exps: {
                url: `"/api/app/iot_things/" + $event.sender['data-record-id']`,
              },
            },
            {
              $action: "loadStoreData",
              storeName: "list",
            },
          ],
        },
        {
          $type: "rapidTableAction",
          code: "enable",
          actionText: "启用",
          $exps: {
            _hidden: "$slot.record.state === 'enabled'",
          },
          onAction: [
            {
              $action: "sendHttpRequest",
              method: "PATCH",
              data: { state: "enabled" },
              $exps: {
                url: `"/api/app/iot_things/" + $event.sender['data-record-id']`,
              },
            },
            {
              $action: "loadStoreData",
              storeName: "list",
            },
          ],
        },
        {
          $type: "sonicRecordActionDeleteEntity",
          code: "delete",
          actionType: "delete",
          actionText: "删除",
          dataSourceCode: "list",
          entityCode: "IotThing",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      searchForm: {
        entityCode: "IotThing",
        items: [
          {
            type: "auto",
            code: "name",
            filterMode: "contains",
          },
        ],
      },
    },
  ],
};

export default page;
