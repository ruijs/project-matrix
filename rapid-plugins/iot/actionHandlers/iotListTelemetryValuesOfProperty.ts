import type { ActionHandlerContext } from "@ruiapp/rapid-core";
import type IotPlugin from "../IotPlugin";
import { IotProperty } from "../IotPluginTypes";

export const code = "iotListTelemetryValuesOfProperty";

export type ListTelemetryValuesOfPropertyActionHandlerConfig = {};

export type ListTelemetryValuesOfPropertyAction = {
  thingId: number;
  propertyId?: number;
  propertyCode?: string;
  limit: number;
};

export async function handler(plugin: IotPlugin, ctx: ActionHandlerContext, config: ListTelemetryValuesOfPropertyActionHandlerConfig) {
  const { routerContext: routeContext, server } = ctx;
  const input: ListTelemetryValuesOfPropertyAction = ctx.input;

  const propertyEntityManager = server.getEntityManager<IotProperty>("iot_property");
  const { thingId, limit } = input;

  let { propertyId, propertyCode } = input;
  if (propertyId) {
    const property = await propertyEntityManager.findById({
      routeContext,
      id: propertyId,
    });
    if (!property) {
      throw new Error(`Property with id "${propertyId}" was not found.`);
    }

    propertyCode = property.code;
  } else {
    if (!propertyCode) {
      throw new Error("Property code or property id is required.");
    }

    const property = await propertyEntityManager.findEntity({
      routeContext,
      filters: [
        {
          operator: "eq",
          field: "code",
          value: propertyCode,
        },
      ],
    });

    if (!property) {
      throw new Error(`Property with code "${propertyCode}" was not found.`);
    }
  }

  const telemetryValues = await plugin.timeSeriesDataService.listTelemetryValuesOfProperty({
    thingId,
    propertyCode,
    limit,
  });

  ctx.output = telemetryValues;
}
