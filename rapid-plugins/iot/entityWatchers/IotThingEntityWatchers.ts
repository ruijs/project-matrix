import { getEntityRelationTargetId, type EntityWatcher, type EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import type { IotThing, IotType } from "~/_definitions/meta/entity-types";
import { v4 as uuidv4 } from "uuid";
import TimeSeriesDataService from "../services/TimeSeriesDataService";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "iot_thing",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { payload } = ctx;

      const before: Partial<IotThing> = payload.before;

      before.accessToken = uuidv4();
    },
  },

  {
    eventName: "entity.create",
    modelSingularCode: "iot_thing",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload, routerContext: routeContext } = ctx;

      const thing: Partial<IotThing> = payload.after;

      const typeEntityManager = server.getEntityManager<IotType>("iot_type");
      const typeId = getEntityRelationTargetId(thing, "type", "type_id");
      const type = await typeEntityManager.findById({
        routeContext,
        id: typeId,
      });

      const timeSeriesDataService = server.getService<TimeSeriesDataService>("timeSeriesDataService");
      await timeSeriesDataService.createTableOfThing(type as any, thing as any);
    },
  },
] satisfies EntityWatcher<any>[];
