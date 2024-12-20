import type { ActionHandlerContext, CronJobConfiguration } from "@ruiapp/rapid-core";
import type PrinterService from "rapid-plugins/printerService/PrinterService";

export default {
  code: "detectOfflinePrinters",

  cronTime: "*/2 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext, logger } = ctx;
    logger.info("Executing detectOfflinePrinters job...");

    const printerService = server.getService<PrinterService>("printerService");
    await printerService.detectOfflinePrinters(routeContext);

    logger.info("Finished detectOfflinePrinters job...");
  },
} satisfies CronJobConfiguration;
