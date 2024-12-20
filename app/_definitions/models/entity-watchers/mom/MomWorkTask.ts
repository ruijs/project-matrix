import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_work_task",
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
] satisfies EntityWatcher<any>[];
