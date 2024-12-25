import type { RapidEntityFormRockConfig, RapidPage, SonicEntityDetailsRockConfig, SonicEntityListRockConfig } from "@ruiapp/rapid-extension";

const page: RapidPage = {
  code: "iot_thing_details",
  name: "物品详情",
  title: "物品详情",
  permissionCheck: { any: ["iot.manage"] },
  view: [
    {
      $type: "sonicEntityDetails",
      entityCode: "IotThing",
      column: 3,
      extraProperties: ["type"],
      relations: {
        type: {
          relations: {
            properties: true,
          },
        },
      },
      statePropertyCode: "state",
      descriptionItems: [
        {
          code: "gateway",
        },
        {
          code: "accessToken",
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
          key: "measurements",
          label: "监控指标",
          children: [
            {
              $id: "measurementList",
              $type: "list",
              separator: {
                $type: "box",
                style: { height: "10px" },
              },
              item: {
                $type: "antdCard",
                bodyStyle: {
                  padding: "10px",
                },
                children: [
                  {
                    $type: "iotPropertyValueTendencyChart",
                    height: "150px",
                    $exps: {
                      thingId: "$rui.parseQuery().id",
                      propertyCode: "$slot.item.code",
                      step: "$slot.item.dataType == 'boolean'",
                      dataType: "$slot.item.dataType",
                    },
                  },
                ],
                $exps: {
                  title: "$slot.item.name + ' - ' + $slot.item.code",
                },
              },

              $exps: {
                dataSource: "_.filter(_.get(_.first(_.get($stores.detail, 'data.list')), 'type.properties'), (item) => item.storageType === 'measurement')",
              },
            },
          ],
        },
      ],
    },
  ],
};

export default page;
