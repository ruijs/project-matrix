import { getEntityRelationTargetId, type EntityWatcher, type EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import type { IotProperty, IotType } from "~/_definitions/meta/entity-types";
import TimeSeriesDataService from "../services/TimeSeriesDataService";

export default [
  {
    eventName: "entity.create",
    modelSingularCode: "iot_property",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload, routerContext: routeContext } = ctx;

      const property: Partial<IotProperty> = payload.after;

      const typeEntityManager = server.getEntityManager<IotType>("iot_type");
      const typeId = getEntityRelationTargetId(property, "type", "type_id");
      const type = await typeEntityManager.findById({
        routeContext,
        id: typeId,
      });

      const timeSeriesDataService = server.getService<TimeSeriesDataService>("timeSeriesDataService");
      // create ts table when first measurement property was created.
      if (property.storageType === "measurement") {
        const propertyEntityManager = server.getEntityManager<IotProperty>("iot_property");
        const measurements = await propertyEntityManager.findEntities({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "type_id",
              value: typeId,
            },
            {
              operator: "eq",
              field: "storageType",
              value: "measurement",
            },
          ],
        });

        if (measurements.length === 1) {
          // 当创建第一个测量指标时，创建时序数据库表
          await timeSeriesDataService.createTableOfTypeWithFirstMeasurement(type as any, property as any);
        } else {
          // 创建后续测量指标时，创建列
          await timeSeriesDataService.createColumnOfMeasurementProperty(type as any, property as any);
        }
      } else if (property.storageType === "dataTag") {
        // 创建数据标签类型的属性时，在时序库中添加标签
        await timeSeriesDataService.createTagOfDataTagProperty(type as any, property as any);
      }
    },
  },
] satisfies EntityWatcher<any>[];
