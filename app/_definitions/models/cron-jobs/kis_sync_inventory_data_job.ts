import type { ActionHandlerContext, CronJobConfiguration, IRpdServer } from "@ruiapp/rapid-core";
import KisDataSync from "~/sdk/kis/sync";

export default {
  code: "kis-sync-inventory-data-job",

  disabled: true,

  cronTime: "40 9 * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;

    // await syncKisInventoryData(ctx, server);
  },
} satisfies CronJobConfiguration;

async function syncKisInventoryData(ctx: ActionHandlerContext, server: IRpdServer) {
  const { routerContext: routeContext } = ctx;
  const dataSync = new KisDataSync(server, ctx);
  await dataSync.initialize();
  // await dataSync.syncBaseData();
  await dataSync.syncInventoryData(routeContext);
}
