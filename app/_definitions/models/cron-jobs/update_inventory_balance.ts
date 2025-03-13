import type { ActionHandlerContext, CronJobConfiguration } from "@ruiapp/rapid-core";
import { updateInventoryBalance } from "../server-operations/mom/splitGoods";

export default {
  code: "update-inventory-balance-job",

  cronTime: "* * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;

    await updateInventoryBalance(server);
  },
} satisfies CronJobConfiguration;
