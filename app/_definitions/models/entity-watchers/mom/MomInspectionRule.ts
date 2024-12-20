import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { MomInspectionRule } from "~/_definitions/meta/entity-types";

export default [
  {
    eventName: "entity.update",
    modelSingularCode: "mom_inspection_rule",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const changes = payload.changes;
      const after = payload.after;
      const before = payload.before;

      try {
        const operationTarget = await server.getEntityManager<MomInspectionRule>("mom_inspection_rule").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: after.id,
            },
          ],
          properties: ["id", "name", "material"],
        });

        if (changes) {
          if (ctx?.routerContext?.state.userId) {
            await server.getEntityManager("sys_audit_log").createEntity({
              routeContext,
              entity: {
                user: { id: ctx?.routerContext?.state.userId },
                targetSingularCode: "mom_inspection_rule",
                targetSingularName: `检验规则 -${operationTarget?.name}- [${operationTarget?.material.code}-${operationTarget?.material.name}-${operationTarget?.material.specification}]`,
                method: "update",
                changes: changes,
                before: before,
              },
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
  {
    eventName: "entity.beforeDelete",
    modelSingularCode: "mom_inspection_rule",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeDelete">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const before = payload.before;
      try {
        const operationTarget = await server.getEntityManager<MomInspectionRule>("mom_inspection_rule").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: before.id,
            },
          ],
          properties: ["id", "name", "material"],
        });
        if (ctx?.routerContext?.state.userId) {
          await server.getEntityManager("sys_audit_log").createEntity({
            routeContext,
            entity: {
              user: { id: ctx?.routerContext?.state.userId },
              targetSingularCode: "mom_inspection_rule",
              targetSingularName: `检验规则 -${operationTarget?.name}- [${operationTarget?.material.code}-${operationTarget?.material.name}-${operationTarget?.material.specification}]`,
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
