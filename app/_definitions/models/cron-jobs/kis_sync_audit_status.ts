import type { ActionHandlerContext, CronJobConfiguration, IRpdServer } from "@ruiapp/rapid-core";
import KisDataSync from "~/sdk/kis/sync";

export default {
  code: "kis-sync-audit-status",

  disabled: true,

  cronTime: "*/5 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;

    await syncKisAuditStatus(ctx, server);
  },
} satisfies CronJobConfiguration;

async function syncKisAuditStatus(ctx: ActionHandlerContext, server: IRpdServer) {
  const { routerContext: routeContext } = ctx;
  const dataSync = new KisDataSync(server, ctx);
  await dataSync.initialize();
  await dataSync.syncKisAuditStatus(routeContext);
}
