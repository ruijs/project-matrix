import type { IPluginActionHandler } from "@ruiapp/rapid-core";
import * as saveTelemetryValuesFromGateway from "./saveTelemetryValuesFromGateway";
import * as saveTelemetryValuesFromThing from "./saveTelemetryValuesFromThing";

export default [saveTelemetryValuesFromGateway as any, saveTelemetryValuesFromThing as any] satisfies IPluginActionHandler[];
