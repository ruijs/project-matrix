import type {
  RapidEntityFormConfig,
  RapidEntityFormRockConfig,
  RapidPage,
  SonicEntityDetailsRockConfig,
  SonicEntityListRockConfig,
} from "@ruiapp/rapid-extension";
import { cloneDeep } from "lodash";

const attributeFormConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "dataType",
    },
    {
      type: "auto",
      code: "code",
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
      code: "isDataTag",
    },
    {
      type: "auto",
      code: "state",
    },
    {
      type: "auto",
      code: "orderNum",
    },
  ],
  defaultFormFields: {
    dataType: "text",
    state: "enabled",
    orderNum: 0,
  },
};

const measurementFormConfig: Partial<RapidEntityFormConfig> = {
  items: [
    {
      type: "auto",
      code: "dataType",
    },
    {
      type: "auto",
      code: "code",
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
      code: "dataLength",
      required: true,
    },
    {
      type: "auto",
      code: "state",
    },
    {
      type: "auto",
      code: "orderNum",
    },
  ],
  defaultFormFields: {
    dataType: "double",
    dataLength: 0,
    state: "enabled",
    orderNum: 0,
  },
};

const page: RapidPage = {
  code: "iot_type_details",
  name: "类型详情",
  title: "类型详情",
  permissionCheck: { any: ["iot.manage"] },
  view: [
    {
      $type: "sonicEntityDetails",
      entityCode: "IotType",
      column: 1,
      extraProperties: [],
      subTitlePropertyCode: "code",
      statePropertyCode: "state",
      descriptionItems: [
        {
          labelStyle: { display: "none" },
          code: "description",
        },
      ],
      $exps: {
        entityId: "$rui.parseQuery().id",
      },
    } satisfies SonicEntityDetailsRockConfig,
    {
      $type: "antdTabs",
      items: [
        {
          key: "things",
          label: "物品",
          children: [
            {
              $id: "thingList",
              $type: "sonicEntityList",
              entityCode: "IotThing",
              viewMode: "table",
              fixedFilters: [
                {
                  field: "type",
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
              orderBy: [
                {
                  field: "code",
                },
              ],
              extraActions: [
                {
                  $type: "sonicToolbarFormItem",
                  formItemType: "search",
                  placeholder: "搜索编号、描述",
                  actionEventName: "onSearch",
                  filterMode: "contains",
                  filterFields: ["code", "description"],
                },
              ],
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
                  code: "accessToken",
                  width: "300px",
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
              $exps: {
                "fixedFilters[0].filters[0].value": "$rui.parseQuery().id",
              },
            } satisfies SonicEntityListRockConfig,
          ],
        },
        {
          key: "properties",
          label: "属性",
          children: [
            {
              $type: "sonicEntityList",
              entityCode: "IotAttribute",
              viewMode: "table",
              selectionMode: "none",
              pageSize: -1,
              fixedFilters: [
                {
                  field: "type_id",
                  operator: "eq",
                  value: "",
                },
              ],
              orderBy: [
                {
                  field: "orderNum",
                },
              ],
              listActions: [
                {
                  $type: "sonicToolbarNewEntityButton",
                  text: "新建",
                  icon: "PlusOutlined",
                  actionStyle: "primary",
                },
              ],
              columns: [
                {
                  type: "auto",
                  code: "orderNum",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "dataType",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "code",
                  width: "250px",
                },
                {
                  type: "auto",
                  code: "name",
                  width: "250px",
                },
                {
                  type: "auto",
                  code: "description",
                },
                {
                  type: "auto",
                  code: "isDataTag",
                  width: "80px",
                },
                {
                  type: "auto",
                  code: "state",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "createdAt",
                  width: "160px",
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
                  entityCode: "IotAttribute",
                },
              ],
              newForm: cloneDeep(attributeFormConfig),
              editForm: cloneDeep(attributeFormConfig),
              $exps: {
                "fixedFilters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.type_id": "$rui.parseQuery().id",
              },
            } satisfies SonicEntityListRockConfig,
          ],
        },
        {
          key: "measurements",
          label: "监控指标",
          children: [
            {
              $type: "sonicEntityList",
              entityCode: "IotMeasurement",
              viewMode: "table",
              selectionMode: "none",
              pageSize: -1,
              fixedFilters: [
                {
                  field: "type_id",
                  operator: "eq",
                  value: "",
                },
              ],
              orderBy: [
                {
                  field: "orderNum",
                },
              ],
              listActions: [
                {
                  $type: "sonicToolbarNewEntityButton",
                  text: "新建",
                  icon: "PlusOutlined",
                  actionStyle: "primary",
                },
              ],
              columns: [
                {
                  type: "auto",
                  code: "orderNum",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "dataType",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "code",
                  width: "250px",
                },
                {
                  type: "auto",
                  code: "name",
                  width: "250px",
                },
                {
                  type: "auto",
                  code: "description",
                },
                {
                  type: "auto",
                  code: "dataLength",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "state",
                  width: "100px",
                },
                {
                  type: "auto",
                  code: "createdAt",
                  width: "160px",
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
                  entityCode: "IotMeasurement",
                },
              ],
              newForm: cloneDeep(measurementFormConfig),
              editForm: cloneDeep(measurementFormConfig),
              $exps: {
                "fixedFilters[0].value": "$rui.parseQuery().id",
                "newForm.fixedFields.type_id": "$rui.parseQuery().id",
              },
            } satisfies SonicEntityListRockConfig,
          ],
        },
      ],
    },
  ],
};

export default page;
