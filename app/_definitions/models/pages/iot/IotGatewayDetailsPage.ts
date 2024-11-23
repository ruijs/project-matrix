import type { RapidEntityFormRockConfig, RapidPage, SonicEntityDetailsRockConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "iot_gateway_details",
  name: "网关详情",
  title: "网关详情",
  permissionCheck: { any: ["iot.manage"] },
  view: [
    {
      $type: "sonicEntityDetails",
      entityCode: "IotGateway",
      column: 3,
      extraProperties: [],
      statePropertyCode: "state",
      descriptionItems: [
        {
          code: "accessToken",
        },
        {
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
          label: "管理物品",
          children: [
            {
              $id: "thingList",
              $type: "sonicEntityList",
              entityCode: "IotThing",
              viewMode: "table",
              fixedFilters: [
                {
                  field: "gateway",
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
      ],
    },
  ],
};

export default page;
