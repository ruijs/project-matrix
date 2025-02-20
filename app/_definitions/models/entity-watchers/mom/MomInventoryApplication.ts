import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { MomInventoryApplication, MomInventoryApplicationItem, MomInventoryOperation } from "~/_definitions/meta/entity-types";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_inventory_application",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { payload } = ctx;
      let entity: MomInventoryApplication = payload.before;

      validateInventoryApplication(entity);

      if (entity.source === "manual") {
        (entity as any).biller_id = ctx.routerContext?.state.userId;
      }
    },
  },
  {
    eventName: "entity.update",
    modelSingularCode: "mom_inventory_application",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const before = payload.before;
      const changes = payload.changes;
      const after = payload.after;

      try {
        const inventoryApplication = await server.getEntityManager<MomInventoryApplication>("mom_inventory_application").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: after.id,
            },
          ],
          properties: ["id", "code", "businessType"],
        });

        if (changes.from || changes.to) {
          const inventoryOperation = await server.getEntityManager<MomInventoryOperation>("mom_inventory_operation").findEntity({
            routeContext,
            filters: [
              {
                operator: "eq",
                field: "application_id",
                value: after.id,
              },
            ],
            properties: ["id", "code", "businessType"],
          });

          if (inventoryOperation) {
            await server.getEntityManager<MomInventoryOperation>("mom_inventory_operation").updateEntityById({
              routeContext,
              id: inventoryOperation.id,
              entityToSave: {
                warehouse: changes.from || changes.to,
              },
            });
          }
        }

        if (changes) {
          if (ctx?.routerContext?.state.userId) {
            await server.getEntityManager("sys_audit_log").createEntity({
              routeContext,
              entity: {
                user: { id: ctx?.routerContext?.state.userId },
                targetSingularCode: "mom_inventory_application",
                targetSingularName: `库存申请单 - ${inventoryApplication?.businessType?.name} - ${inventoryApplication?.code}`,
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
    modelSingularCode: "mom_inventory_application",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeDelete">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const before = payload.before;
      try {
        const inventoryOperation = await server.getEntityManager<MomInventoryApplication>("mom_inventory_application").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: before.id,
            },
          ],
          properties: ["id", "code", "businessType"],
        });

        if (ctx?.routerContext?.state.userId) {
          await server.getEntityManager("sys_audit_log").createEntity({
            routeContext,
            entity: {
              user: { id: ctx?.routerContext?.state.userId },
              targetSingularCode: "mom_inventory_application",
              targetSingularName: `库存申请单 - ${inventoryOperation?.businessType?.name} - ${inventoryOperation?.code}`,
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

function validateInventoryApplication(application: MomInventoryApplication) {
  // 物品数量不能为0
  const applicationItems: MomInventoryApplicationItem[] = application.items;
  if (!applicationItems || !applicationItems.length) {
    throw new Error("物品明细项不能为空。");
  }

  for (const applicationItem of applicationItems) {
    const quantity = applicationItem.quantity || 0;
    if (quantity <= 0) {
      throw new Error("物品数量必须大于0。");
    }
  }
}
