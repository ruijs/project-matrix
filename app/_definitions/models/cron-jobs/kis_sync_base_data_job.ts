import type { ActionHandlerContext, CronJobConfiguration, IRpdServer } from "@ruiapp/rapid-core";
import KisDataSync from "~/sdk/kis/sync";
import { getBooleanEnvValue } from "~/utils/env-utils";

export default {
  code: "kis-sync-base-data-job",

  disabled: getBooleanEnvValue("KIS_SYNC_BASE_DATA_JOB_DISABLED"),

  cronTime: "*/10 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    logger.info("Executing kis base data sync job...");

    await syncKisData(ctx, server);

    logger.info("Finished kis base data sync job...");
  },
} satisfies CronJobConfiguration;

async function syncKisData(ctx: ActionHandlerContext, server: IRpdServer) {
  const { routerContext: routeContext } = ctx;
  const dataSync = new KisDataSync(server, ctx);
  await dataSync.initialize();
  await dataSync.syncBaseData(routeContext);
}
