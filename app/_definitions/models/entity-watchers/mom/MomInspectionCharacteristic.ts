import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { MomInspectionCharacteristic } from "~/_definitions/meta/entity-types";

export default [
  {
    eventName: "entity.update",
    modelSingularCode: "mom_inspection_characteristic",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const changes = payload.changes;
      const after = payload.after;
      const before = payload.before;

      try {
        const operationTarget = await server.getEntityManager<MomInspectionCharacteristic>("mom_inspection_characteristic").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: after.id,
            },
          ],
          properties: ["id", "rule", "name"],
        });

        if (changes && ctx?.routerContext?.state.userId) {
          await server.getEntityManager("sys_audit_log").createEntity({
            routeContext,
            entity: {
              user: { id: ctx?.routerContext?.state.userId },
              targetSingularCode: "mom_inspection_characteristic",
              targetSingularName: `检验特征-${operationTarget?.rule?.name}-${operationTarget?.name}`,
              method: "update",
              changes: changes,
              before: before,
            },
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
  {
    eventName: "entity.beforeDelete",
    modelSingularCode: "mom_inspection_characteristic",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeDelete">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const before = payload.before;
      try {
        const operationTarget = await server.getEntityManager<MomInspectionCharacteristic>("mom_inspection_characteristic").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: before.id,
            },
          ],
          properties: ["id", "rule", "name"],
        });
        if (ctx?.routerContext?.state.userId) {
          await server.getEntityManager("sys_audit_log").createEntity({
            routeContext,
            entity: {
              user: { id: ctx?.routerContext?.state.userId },
              targetSingularCode: "mom_inspection_characteristic",
              targetSingularName: `检验特征-${operationTarget?.rule?.name}-${operationTarget?.name}`,
              method: "delete",
              before: before,
            },
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
] satisfies EntityWatcher<any>[];
