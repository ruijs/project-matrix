import type { ActionHandlerContext, CronJobConfiguration, IRpdServer } from "@ruiapp/rapid-core";
import KisDataSync from "~/sdk/kis/sync";

export default {
  code: "kis-sync-base-data-job",

  cronTime: "*/5 * * * *",

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
