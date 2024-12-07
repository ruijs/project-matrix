import type { IPluginActionHandler } from "@ruiapp/rapid-core";
import * as iotListTelemetryValuesOfProperty from "./iotListTelemetryValuesOfProperty";
import * as iotSaveTelemetryValuesFromGateway from "./iotSaveTelemetryValuesFromGateway";
import * as iotSaveTelemetryValuesFromThing from "./iotSaveTelemetryValuesFromThing";

export default [
  iotListTelemetryValuesOfProperty as any,
  iotSaveTelemetryValuesFromGateway as any,
  iotSaveTelemetryValuesFromThing as any,
] satisfies IPluginActionHandler[];
