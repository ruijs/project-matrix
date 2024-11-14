import type {EntityWatcher, EntityWatchHandlerContext} from "@ruiapp/rapid-core";
import type {HuateWarehouseOperation, MomMaterialInventoryBalance} from "~/_definitions/meta/entity-types";

export default [
  {
    eventName: "entity.create",
    modelSingularCode: "huate_warehouse_operation",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload } = ctx;
      let after = payload.after;

      const operation = await server.getEntityManager<HuateWarehouseOperation>("mom_material_inventory_balance").findEntity({
        filters: [
          { operator: "eq", field: "material_id", value: after?.material?.id || after?.material || after.material_id },
        ],
        properties: ["id", "material", "quantity"],
      })

      const inventory = await server.getEntityManager<MomMaterialInventoryBalance>("mom_material_inventory_balance").findEntity({
        filters: [
          { operator: "eq", field: "material_id", value: operation?.material?.id },
        ],
        properties: ["id", "onHandQuantity"],
      })

      if (inventory) {
        await server.getEntityManager<MomMaterialInventoryBalance>("mom_material_inventory_balance").updateEntityById({
          id: inventory?.id,
          entityToSave: {
            onHandQuantity: (inventory?.onHandQuantity || 0) - (operation?.quantity || 0),
          }
        })
      } else {
        await server.getEntityManager<MomMaterialInventoryBalance>("mom_material_inventory_balance").createEntity({
          entity: {
            material: { id: operation?.material?.id },
            onHandQuantity: -(operation?.quantity || 0),
          }
        })
      }
    }
  },
] satisfies EntityWatcher<any>[];
