import type { ActionHandlerContext } from "@ruiapp/rapid-core";
import type PrinterPlugin from "../PrinterPlugin";
import type { CreatePrintTasksInput } from "../PrinterPluginTypes";

export const code = "createPrintTasks";

export type CreatePrintTasksActionHandlerConfig = {};

export async function handler(plugin: PrinterPlugin, ctx: ActionHandlerContext, config: CreatePrintTasksActionHandlerConfig) {
  const { routerContext: routeContext } = ctx;
  const input: CreatePrintTasksInput = ctx.input;

  ctx.logger.debug("createPrintTasks: " + JSON.stringify(input));

  await plugin.printerService.createPrintTasks(routeContext, input);

  ctx.output = {};
}
