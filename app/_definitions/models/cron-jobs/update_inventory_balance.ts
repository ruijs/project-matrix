import type { ActionHandlerContext, CronJobConfiguration, IRpdServer } from "@ruiapp/rapid-core";
import KingdeeSDK from "~/sdk/kis/api";
import { SaveKisConfigInput } from "~/_definitions/meta/entity-types";
import { updateInventoryBalance } from "../server-operations/mom/splitGoods";

export default {
  code: "update-inventory-balance-job",

  cronTime: "* * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;

    await updateInventoryBalance(server);

    logger.info("Finished update inventory balance job...");
  },
} satisfies CronJobConfiguration;
