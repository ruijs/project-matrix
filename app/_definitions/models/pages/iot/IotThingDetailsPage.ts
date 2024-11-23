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
            measurements: true,
          },
        },
      },
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
                $exps: {
                  title: "$self.value.name + ' - ' + $self.value.code",
                },
              },

              $exps: {
                dataSource: "_.get(_.first(_.get($stores.detail, 'data.list')), 'type.measurements')",
              },
            },
          ],
        },
      ],
    },
  ],
};

export default page;
