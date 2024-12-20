import type { ActionHandlerContext } from "@ruiapp/rapid-core";
import type PrinterPlugin from "../BpmPlugin";
import type { CreateProcessInstanceInput } from "../BpmPluginTypes";

export const code = "createProcessInstance";

export type CreatePrintTasksActionHandlerConfig = {};

export async function handler(plugin: PrinterPlugin, ctx: ActionHandlerContext, config: CreatePrintTasksActionHandlerConfig) {
  const { routerContext: routeContext } = ctx;
  const input: CreateProcessInstanceInput = ctx.input;

  const processInstance = await plugin.bpmService.createProcessInstance(routeContext, input);

  ctx.output = processInstance;
}
