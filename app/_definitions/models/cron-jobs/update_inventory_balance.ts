import type { ActionHandlerContext, CronJobConfiguration } from "@ruiapp/rapid-core";
import { updateInventoryBalance } from "../server-operations/mom/splitGoods";
import { getBooleanEnvValue } from "~/utils/env-utils";

export default {
  code: "update-inventory-balance-job",

  disabled: getBooleanEnvValue("WMS_UPDATE_INVENTORY_BALANCE_JOB_DISABLED"),

  cronTime: "* * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;

    await updateInventoryBalance(server);
  },
} satisfies CronJobConfiguration;
