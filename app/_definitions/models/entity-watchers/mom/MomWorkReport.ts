import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_work_report",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      let before = payload.before;

      const routeProcess = await server.getEntityManager("mom_route_process").findEntity({
        routeContext,
        filters: [{ operator: "eq", field: "id", value: before.routeProcess }],
        properties: ["id", "process"],
      });

      if (routeProcess) {
        before.process_id = routeProcess?.process?.id;
      }
    },
  },
  {
    eventName: "entity.create",
    modelSingularCode: "mom_work_report",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const after = payload.after;

      if (!after.work_order_id) {
        return;
      }

      const workOrderEntityManager = server.getEntityManager("mom_work_order");
      await workOrderEntityManager.updateEntityById({
        routeContext,
        id: after.work_order_id,
        entityToSave: {
          executionState: "processing",
        },
      });
    },
  },
] satisfies EntityWatcher<any>[];
