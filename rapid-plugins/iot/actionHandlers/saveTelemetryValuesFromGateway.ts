import type { ActionHandlerContext } from "@ruiapp/rapid-core";
import type IotPlugin from "../IotPlugin";
import type { IotThing, TelemetryValuesOfThings } from "../IotPluginTypes";
import { IotGateway } from "~/_definitions/meta/entity-types";

export const code = "iotSaveTelemetryValuesFromGateway";

export type SaveTelemetryValuesFromGatewayActionHandlerConfig = {};

export async function handler(plugin: IotPlugin, ctx: ActionHandlerContext, config: SaveTelemetryValuesFromGatewayActionHandlerConfig) {
  const { routerContext: routeContext, server } = ctx;

  const input: TelemetryValuesOfThings = ctx.input;

  const authorization = routeContext.request.headers.get("Authorization");
  if (!authorization) {
    throw new Error("Unauthorized.");
  }

  const authParts = authorization.split(" ");
  if (authParts.length !== 2 || authParts[0] !== "Bearer") {
    throw new Error("Unsupported authorization method. Bearer token authorization should be used.");
  }

  const gatewayEntityManager = server.getEntityManager<IotGateway>("iot_gateway");
  const gateway = await gatewayEntityManager.findEntity({
    routeContext,
    properties: ["id", "state"],
    filters: [
      {
        operator: "eq",
        field: "accessToken",
        value: authParts[1],
      },
    ],
    relations: {
      managedThings: {
        properties: ["id", "code"],
      },
    },
  });

  if (!gateway) {
    throw new Error("Invalid access token.");
  }

  if (gateway.state === "disabled") {
    throw new Error(`Gateway with code "${gateway.code}" was disabed.`);
  }

  // Check gateway-thing bindings
  const unmanagedThingCodes: string[] = [];
  const telemetryValuesOfThings: TelemetryValuesOfThings = {};

  const managedThings: IotThing[] = gateway.managedThings || [];
  for (const thingCode in input) {
    if (managedThings.find((item) => item.code === thingCode)) {
      telemetryValuesOfThings[thingCode] = input[thingCode];
    } else {
      unmanagedThingCodes.push(thingCode);
    }
  }

  if (Object.keys(telemetryValuesOfThings).length) {
    await plugin.timeSeriesDataService.createTelemetryValuesOfThings(routeContext, telemetryValuesOfThings);
  }

  const result: any = {};
  if (unmanagedThingCodes.length) {
    result.warnings = [
      {
        message: "Telemetry values of these things are ignored, because they are not managed by this gateway: " + unmanagedThingCodes.join(", "),
      },
    ];
  }
  ctx.output = result;
}
