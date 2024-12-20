import type { ActionHandlerContext } from "@ruiapp/rapid-core";
import type PrinterPlugin from "../PrinterPlugin";
import type { UpdatePrintTaskStateInput } from "../PrinterPluginTypes";

export const code = "updatePrintTaskState";

export type UpdatePrintTaskStateActionHandlerConfig = {};

export async function handler(plugin: PrinterPlugin, ctx: ActionHandlerContext, config: UpdatePrintTaskStateActionHandlerConfig) {
  const input: UpdatePrintTaskStateInput = ctx.input;

  await plugin.printerService.updatePrintTaskState(input);

  ctx.output = {};
}
