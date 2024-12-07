import type { ActionHandlerContext } from "@ruiapp/rapid-core";
import type IotPlugin from "../IotPlugin";
import { IotThing, type ThingTelemetryValuesEntry } from "../IotPluginTypes";

export const code = "iotSaveTelemetryValuesFromThing";

export type SaveTelemetryValuesFromThingActionHandlerConfig = {};

export async function handler(plugin: IotPlugin, ctx: ActionHandlerContext, config: SaveTelemetryValuesFromThingActionHandlerConfig) {
  const { routerContext: routeContext, server } = ctx;
  const input: ThingTelemetryValuesEntry[] = ctx.input;

  const authorization = routeContext.request.headers.get("Authorization");
  if (!authorization) {
    throw new Error("Unauthorized.");
  }

  const authParts = authorization.split(" ");
  if (authParts.length !== 2 || authParts[0] !== "Bearer") {
    throw new Error("Unsupported authorization method. Bearer token authorization should be used.");
  }

  const thingEntityManager = server.getEntityManager<IotThing>("iot_thing");
  const thing = await thingEntityManager.findEntity({
    routeContext,
    filters: [
      {
        operator: "eq",
        field: "accessToken",
        value: authParts[1],
      },
    ],
  });

  if (!thing) {
    throw new Error("Invalid access token.");
  }

  if (thing.state === "disabled") {
    throw new Error(`Thing with code "${thing.code}" was disabed.`);
  }

  const thingCode = thing.code;
  await plugin.timeSeriesDataService.createTelemetryValuesOfThings(routeContext, {
    [thingCode]: input,
  });

  ctx.output = {};
}
