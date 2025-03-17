import type { ActionHandlerContext, CronJobConfiguration, IRpdServer } from "@ruiapp/rapid-core";
import EntitySyncService from "rapid-plugins/entitySync/services/EntitySyncService";
import EventLogService from "rapid-plugins/eventLog/services/EventLogService";
import syncKisCustomer from "sync-contracts/syncKisCustomer";
import syncKisDepartment from "sync-contracts/syncKisDepartment";
import syncKisEmployee from "sync-contracts/syncKisEmployee";
import syncKisLogisticSupplier from "sync-contracts/syncKisLogisticSupplier";
import syncKisMaterial from "sync-contracts/syncKisMaterial";
import syncKisMaterialCategory from "sync-contracts/syncKisMaterialCategory";
import syncKisMaterialDetail from "sync-contracts/syncKisMaterialDetail";
import syncKisStock from "sync-contracts/syncKisStock";
import syncKisStockPlace from "sync-contracts/syncKisStockPlace";
import syncKisSupplier from "sync-contracts/syncKisSupplier";
import syncKisUnit from "sync-contracts/syncKisUnit";
import syncKisUser from "sync-contracts/syncKisUser";
import KisDataSync from "~/sdk/kis/sync";
import { getBooleanEnvValue } from "~/utils/env-utils";

export default {
  code: "kis-sync-base-data-job",

  disabled: getBooleanEnvValue("KIS_SYNC_BASE_DATA_JOB_DISABLED"),

  cronTime: "* */1 * * *",

  jobOptions: {
    runOnInit: false,
    waitForCompletion: true,
  },

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    logger.info("Executing kis base data sync job...");

    await syncKisBaseData(ctx, server);

    logger.info("Finished kis base data sync job...");
  },
} satisfies CronJobConfiguration;

/**
 * @deprecated
 * @param ctx
 * @param server
 */
async function syncKisData(ctx: ActionHandlerContext, server: IRpdServer) {
  const { routerContext: routeContext } = ctx;
  const dataSync = new KisDataSync(server, ctx);
  await dataSync.initialize();
  await dataSync.syncBaseData(routeContext);
}

async function syncKisBaseData(ctx: ActionHandlerContext, server: IRpdServer) {
  const { routerContext: routeContext } = ctx;
  const entitySyncService = server.getService<EntitySyncService>("entitySyncService");

  const syncContracts = [
    syncKisUnit,
    syncKisStock,
    // syncKisStockPlace,
    syncKisDepartment,
    syncKisEmployee,
    syncKisUser,
    syncKisLogisticSupplier,
    syncKisSupplier,
    syncKisCustomer,
    syncKisMaterialCategory,
    syncKisMaterial,
    syncKisMaterialDetail,
  ];

  for (const syncContract of syncContracts) {
    try {
      await entitySyncService.performSyncCycle(routeContext, syncContract);
    } catch (error: any) {
      const errorMessage = `同步 ${syncContract.sourceEntityTypeName} 失败。${error.message}`;
      ctx.logger.error(errorMessage, { error });

      await server.getService<EventLogService>("eventLogService").createLog({
        sourceType: "app",
        eventTypeCode: "kis.syncExternalToInternal",
        level: "error",
        message: errorMessage,
        details: (error as Error).stack,
      });
    }
  }
}
