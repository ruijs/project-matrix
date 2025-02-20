import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { MomInventoryApplication, MomInventoryApplicationItem } from "~/_definitions/meta/entity-types";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_inventory_application_item",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { payload } = ctx;
      let entity: MomInventoryApplicationItem = payload.before;

      validateInventoryApplicationItem(entity);
    },
  },
  {
    eventName: "entity.create",
    modelSingularCode: "mom_inventory_application_item",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      try {
        let after = payload.after;
        const inventoryApplicationItem = await server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: after.id,
            },
          ],
          properties: ["id", "application", "remark"],
          relations: {
            application: {
              properties: ["id", "businessType", "fDeliveryCode"],
            },
          },
        });

        if (inventoryApplicationItem && inventoryApplicationItem?.application && inventoryApplicationItem?.application?.businessType) {
          if (inventoryApplicationItem?.application?.businessType?.name === "销售出库") {
            if (
              inventoryApplicationItem?.remark &&
              (!inventoryApplicationItem.application?.fDeliveryCode || inventoryApplicationItem.application?.fDeliveryCode === "")
            ) {
              await server.getEntityManager<MomInventoryApplication>("mom_inventory_application").updateEntityById({
                routeContext,
                id: inventoryApplicationItem.application?.id,
                entityToSave: {
                  fDeliveryCode: inventoryApplicationItem.remark,
                },
              });
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
  },

  {
    eventName: "entity.beforeUpdate",
    modelSingularCode: "mom_inventory_application_item",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeUpdate">) => {
      const { payload } = ctx;

      validateInventoryApplicationItem(payload.changes);
    },
  },

  {
    eventName: "entity.update",
    modelSingularCode: "mom_inventory_application_item",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      try {
        let after = payload.after;
        const inventoryApplicationItem = await server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: after.id,
            },
          ],
          properties: ["id", "application", "remark"],
          relations: {
            application: {
              properties: ["id", "businessType", "fDeliveryCode"],
            },
          },
        });

        if (inventoryApplicationItem && inventoryApplicationItem?.application && inventoryApplicationItem?.application?.businessType) {
          if (inventoryApplicationItem?.application?.businessType?.name === "销售出库") {
            if (
              inventoryApplicationItem?.remark &&
              (!inventoryApplicationItem.application?.fDeliveryCode || inventoryApplicationItem.application?.fDeliveryCode === "")
            ) {
              await server.getEntityManager<MomInventoryApplication>("mom_inventory_application").updateEntityById({
                routeContext,
                id: inventoryApplicationItem.application?.id,
                entityToSave: {
                  fDeliveryCode: inventoryApplicationItem.remark,
                },
              });
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
] satisfies EntityWatcher<any>[];

function validateInventoryApplicationItem(applicationItem: MomInventoryApplicationItem) {
  // 物品数量不能为0
  const quantity = applicationItem.quantity || 0;
  if (quantity <= 0) {
    throw new Error("物品数量必须大于0。");
  }
}
