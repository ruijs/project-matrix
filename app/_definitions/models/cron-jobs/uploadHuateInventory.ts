import type {ActionHandlerContext, CronJobConfiguration} from "@ruiapp/rapid-core";
import type {MomMaterialInventoryBalance} from "~/_definitions/meta/entity-types";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";

export default {
  code: "uploadHuateInventory",

  cronTime: "30 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    logger.info("Executing uploadHuateInventory job...");

    const inventories = await server.getEntityManager<MomMaterialInventoryBalance>("mom_material_inventory_balance").findEntities({
      filters: [],
      properties: ["id", "material", "onHandQuantity", "createdAt"],
    })

    for (const inventory of inventories) {
      const yidaSDK = await new YidaHelper(server).NewAPIClient();
      const yidaAPI = new YidaApi(yidaSDK);
      await yidaAPI.uploadWarehouseInventory(inventory)
      await yidaAPI.uploadFAWStock(inventory)
    }

    logger.info("Finished uploadHuateInventory job...");
  },
} satisfies CronJobConfiguration;
