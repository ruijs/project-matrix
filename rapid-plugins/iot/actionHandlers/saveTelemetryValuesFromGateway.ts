import type { ActionHandlerContext } from "@ruiapp/rapid-core";
import type IotPlugin from "../IotPlugin";
import type { TelemetryValuesOfThings } from "../IotPluginTypes";

export const code = "iotSaveTelemetryValuesFromGateway";

export type SaveTelemetryValuesFromGatewayActionHandlerConfig = {};

export async function handler(plugin: IotPlugin, ctx: ActionHandlerContext, config: SaveTelemetryValuesFromGatewayActionHandlerConfig) {
  const { routerContext: routeContext } = ctx;
  // TODO: authentication
  const input: TelemetryValuesOfThings = ctx.input;

  await plugin.timeSeriesDataService.createTelemetryValuesOfThings(routeContext, input);

  ctx.output = {};
}
