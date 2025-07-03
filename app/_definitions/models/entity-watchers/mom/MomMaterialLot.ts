import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { BaseMaterial, SaveSysAuditLogInput } from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";
import { trace } from "console";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "base_lot",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      let before = payload.before;

      if (before.material_id && before.manufactureDate && before.expireTime === undefined) {
        const materialManager = server.getEntityManager<BaseMaterial>("base_material");
        const material = await materialManager.findById({ routeContext, id: before.material_id });

        before.expireTime = dayjs(before.manufactureDate)
          .add(parseInt(material?.qualityGuaranteePeriod || "0", 10), "day")
          .format("YYYY-MM-DD");
      }
    },
  },
  {
    eventName: "entity.beforeUpdate",
    modelSingularCode: "base_lot",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeUpdate">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      let changes = payload.changes;

      if (changes.material && changes.manufactureDate) {
        const materialManager = server.getEntityManager<BaseMaterial>("base_material");
        const material = await materialManager.findById({ routeContext, id: changes?.material?.id });

        changes.expireTime = dayjs(changes.manufactureDate)
          .add(parseInt(material?.qualityGuaranteePeriod || "0", 10), "day")
          .format("YYYY-MM-DD");
      }
    },
  },
  {
    eventName: "entity.update",
    modelSingularCode: "base_lot",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const { before, after, changes } = payload;

      await server.getEntityManager("sys_audit_log").createEntity({
        routeContext,
        entity: {
          user: { id: routeContext?.state.userId },
          targetSingularCode: "base_lot",
          targetId: after.id,
          method: "update",
          before,
          after,
          changes,
        } satisfies SaveSysAuditLogInput,
      });
    },
  },
] satisfies EntityWatcher<any>[];
