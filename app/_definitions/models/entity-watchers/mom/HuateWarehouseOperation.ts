import type {EntityWatcher, EntityWatchHandlerContext} from "@ruiapp/rapid-core";
import type {HuateWarehouseOperation, MomMaterialInventoryBalance} from "~/_definitions/meta/entity-types";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";

export default [
  {
    eventName: "entity.create",
    modelSingularCode: "huate_warehouse_operation",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload } = ctx;
      let after = payload.after;

      const operation = await server.getEntityManager<HuateWarehouseOperation>("huate_warehouse_operation").findEntity({
        filters: [
          { operator: "eq", field: "id", value: after.id },
        ],
        properties: ["id", "material", "quantity"],
      })

      let inventory = await server.getEntityManager<MomMaterialInventoryBalance>("mom_material_inventory_balance").findEntity({
        filters: [
          { operator: "eq", field: "material_id", value: operation?.material?.id },
        ],
        properties: ["id", "material", "onHandQuantity"],
      })

      if (inventory) {
        await server.getEntityManager<MomMaterialInventoryBalance>("mom_material_inventory_balance").updateEntityById({
          routeContext: ctx.routerContext,
          id: inventory?.id,
          entityToSave: {
            onHandQuantity: (inventory?.onHandQuantity || 0) - (operation?.quantity || 0),
          }
        })
      } else {
        await server.getEntityManager<MomMaterialInventoryBalance>("mom_material_inventory_balance").createEntity({
          routeContext: ctx.routerContext,
          entity: {
            material: { id: operation?.material?.id },
            onHandQuantity: -(operation?.quantity || 0),
          }
        })
      }

      inventory = await server.getEntityManager<MomMaterialInventoryBalance>("mom_material_inventory_balance").findEntity({
        filters: [
          { operator: "eq", field: "material_id", value: operation?.material?.id },
        ],
        properties: ["id", "material", "onHandQuantity"],
      })

      if (inventory) {
          const yidaSDK = await new YidaHelper(server).NewAPIClient();
          const yidaAPI = new YidaApi(yidaSDK);
          await yidaAPI.uploadWarehouseInventory(inventory)
      }

    }

  },
] satisfies EntityWatcher<any>[];
