import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { MomInventoryApplication, MomInventoryApplicationItem, MomInventoryOperation } from "~/_definitions/meta/entity-types";

export default [
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
            if (inventoryApplicationItem?.remark && (!inventoryApplicationItem.application?.fDeliveryCode || inventoryApplicationItem.application?.fDeliveryCode === "")) {
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
            if (inventoryApplicationItem?.remark && (!inventoryApplicationItem.application?.fDeliveryCode || inventoryApplicationItem.application?.fDeliveryCode === "")) {
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
