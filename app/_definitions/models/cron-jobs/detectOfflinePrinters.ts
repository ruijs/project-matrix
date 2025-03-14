import type { ActionHandlerContext, CronJobConfiguration } from "@ruiapp/rapid-core";
import type PrinterService from "rapid-plugins/printerService/PrinterService";

export default {
  code: "detectOfflinePrinters",

  cronTime: "*/2 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;

    const printerService = server.getService<PrinterService>("printerService");
    await printerService.detectOfflinePrinters(routeContext);
  },
} satisfies CronJobConfiguration;
