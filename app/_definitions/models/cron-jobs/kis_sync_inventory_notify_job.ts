import type { ActionHandlerContext, CronJobConfiguration, IRpdServer } from "@ruiapp/rapid-core";
import KisDataSync from "~/sdk/kis/sync";
import { getBooleanEnvValue } from "~/utils/env-utils";

export default {
  code: "kis-sync-inventory-notify-job",

  disabled: getBooleanEnvValue("KIS_SYNC_INVENTORY_APPLICATIONS_JOB_DISABLED"),

  cronTime: "*/5 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    logger.info("Executing kis inventory notify sync job...");

    await syncKisInventoryNotify(ctx, server);

    logger.info("Finished kis inventory notify sync job...");
  },
} satisfies CronJobConfiguration;

async function syncKisInventoryNotify(ctx: ActionHandlerContext, server: IRpdServer) {
  const { routerContext: routeContext } = ctx;
  const dataSync = new KisDataSync(server, ctx);
  await dataSync.initialize();
  await dataSync.syncInventoryNotify(routeContext);
}
