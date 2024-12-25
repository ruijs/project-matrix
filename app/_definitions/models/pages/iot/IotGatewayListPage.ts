import { cloneDeep } from "lodash";
import type { RapidPage, RapidEntityFormConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const formConfig: Partial<RapidEntityFormConfig> = {
  items: [
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
      code: "state",
    },
  ],
  defaultFormFields: {
    state: "enabled",
  },
};

const page: RapidPage = {
  code: "iot_gateway_list",
  name: "网关列表",
  title: "网关管理",
  permissionCheck: { any: ["iot.manage"] },
  view: [
    {
      $type: "sonicEntityList",
      entityCode: "IotGateway",
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
            url: "/pages/iot_gateway_details?id={{id}}",
          },
        },
        {
          type: "auto",
          code: "accessToken",
          width: "350px",
          rendererType: "rapidSecretTextRenderer",
          rendererProps: {
            canViewOrigin: true,
            canCopy: true,
            iconStyle: {
              color: "#1890ff",
            },
          },
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
                url: `"/api/app/iot_gateways/" + $event.sender['data-record-id']`,
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
                url: `"/api/app/iot_gateways/" + $event.sender['data-record-id']`,
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
          entityCode: "IotGateway",
        },
      ],
      newForm: cloneDeep(formConfig),
      editForm: cloneDeep(formConfig),
      searchForm: {
        entityCode: "IotGateway",
        items: [
          {
            type: "auto",
            code: "name",
            filterMode: "contains",
          },
        ],
      },
    } satisfies SonicEntityListRockConfig,
  ],
};

export default page;
