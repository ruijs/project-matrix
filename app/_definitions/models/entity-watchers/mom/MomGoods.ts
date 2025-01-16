import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { BaseLot, BaseMaterial, MomGood } from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";

export default [
  {
    eventName: "entity.create",
    modelSingularCode: "mom_good",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      let after = payload.after;

      const momGood = await server.getEntityManager<MomGood>("mom_good").findEntity({
        routeContext,
        filters: [
          {
            operator: "eq",
            field: "id",
            value: after.id,
          },
        ],
        properties: ["id", "lotNum", "manufactureDate", "validityDate", "lot"],
      });

      if (momGood && momGood?.lot && momGood?.manufactureDate && momGood?.validityDate) {
        await server.getEntityManager<BaseLot>("base_lot").updateEntityById({
          routeContext,
          id: momGood.lot.id,
          entityToSave: {
            manufactureDate: momGood.manufactureDate,
            validityDate: momGood.validityDate,
          },
        });
      }
    },
  },
  {
    eventName: "entity.update",
    modelSingularCode: "mom_good",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      let after = payload.after;

      const momGood = await server.getEntityManager<MomGood>("mom_good").findEntity({
        routeContext,
        filters: [
          {
            operator: "eq",
            field: "id",
            value: after.id,
          },
        ],
        properties: ["id", "lotNum", "manufactureDate", "validityDate", "lot"],
      });

      if (momGood && momGood?.lot && momGood?.manufactureDate && momGood?.validityDate) {
        await server.getEntityManager<BaseLot>("base_lot").updateEntityById({
          routeContext,
          id: momGood.lot.id,
          entityToSave: {
            manufactureDate: momGood.manufactureDate,
            validityDate: momGood.validityDate,
          },
        });
      }
    },
  },
] satisfies EntityWatcher<any>[];
