import EntitySyncService from "rapid-plugins/entitySync/services/EntitySyncService";
import { createLogger, createRapidServer } from "../server";
import { RouteContext } from "@ruiapp/rapid-core";
import syncKisStockPlace from "../sync-contracts/syncKisStockPlace";
import syncKisUnit from "../sync-contracts/syncKisUnit";
import syncKisMaterial from "../sync-contracts/syncKisMaterial";
import syncKisLogisticSupplier from "../sync-contracts/syncKisLogisticSupplier";
import syncKisSupplier from "../sync-contracts/syncKisSupplier";
import syncKisCustomer from "../sync-contracts/syncKisCustomer";
import syncKisMaterialDetail from "../sync-contracts/syncKisMaterialDetail";
import syncKisInventoryMaterialReceiptNotice from "../sync-contracts/inventory/syncKisInventoryMaterialReceiptNotice";

async function run() {
  const logger = createLogger();
  const rapidServer = await createRapidServer(logger, {
    DISABLE_CRON_JOB: "true",
  });
  await rapidServer.start();

  const routeContext = RouteContext.newSystemOperationContext(rapidServer);
  await rapidServer.getService<EntitySyncService>("entitySyncService").performSyncCycle(routeContext, syncKisInventoryMaterialReceiptNotice);
}

run();
