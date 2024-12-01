import type { IPluginActionHandler } from "@ruiapp/rapid-core";
import * as saveTelemetryValuesFromGateway from "./saveTelemetryValuesFromGateway";

export default [saveTelemetryValuesFromGateway as any] satisfies IPluginActionHandler[];
