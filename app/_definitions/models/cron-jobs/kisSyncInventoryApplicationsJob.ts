import type { ActionHandlerContext, CronJobConfiguration, IRpdServer } from "@ruiapp/rapid-core";
import EntitySyncService from "rapid-plugins/entitySync/services/EntitySyncService";
import EventLogService from "rapid-plugins/eventLog/services/EventLogService";
import syncKisInventoryMaterialReceiptNotice from "sync-contracts/inventory/syncKisInventoryMaterialReceiptNotice";
import KisDataSync from "~/sdk/kis/sync";
import { getBooleanEnvValue } from "~/utils/env-utils";

export default {
  code: "kisSyncInventoryApplicationsJob",

  disabled: getBooleanEnvValue("KIS_SYNC_INVENTORY_APPLICATIONS_JOB_DISABLED"),

  cronTime: "0 0/5 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    await syncKisInventoryApplications(ctx, server);
  },
} satisfies CronJobConfiguration;

async function syncKisInventoryNotify(ctx: ActionHandlerContext, server: IRpdServer) {
  const { routerContext: routeContext } = ctx;
  const dataSync = new KisDataSync(server, ctx);
  await dataSync.initialize();
  await dataSync.syncInventoryNotify(routeContext);
}

async function syncKisInventoryApplications(ctx: ActionHandlerContext, server: IRpdServer) {
  const { routerContext: routeContext } = ctx;
  const entitySyncService = server.getService<EntitySyncService>("entitySyncService");

  const syncContracts = [syncKisInventoryMaterialReceiptNotice];

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
