import type {ActionHandlerContext, CronJobConfiguration} from "@ruiapp/rapid-core";
import type PrinterService from "rapid-plugins/printerService/PrinterService";
import type {
  HuateWarehouseOperation,
  MomMaterialInventoryBalance,
  MomWorkReport
} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";

export default {
  code: "uploadHuateInventory",

  cronTime: "30 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    logger.info("Executing uploadHuateInventory job...");

    const operations = await server.getEntityManager<HuateWarehouseOperation>("huate_warehouse_operation").findEntities({
      properties: ["id", "material", "quantity"],
    })

    for (const operation of operations) {
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

    logger.info("Finished uploadHuateInventory job...");
  },
} satisfies CronJobConfiguration;
