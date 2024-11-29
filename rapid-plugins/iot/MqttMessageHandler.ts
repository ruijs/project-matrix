import { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import IotPlugin from "./IotPlugin";

export interface MqttMessage {
  topic: string;
  payload: string | Record<string, any>;
}

export default class MqttMessageHandler {
  #server: IRpdServer;
  #iotPlugin: IotPlugin;

  constructor(server: IRpdServer, iotPlugin: IotPlugin) {
    this.#server = server;
    this.#iotPlugin = iotPlugin;
  }

  async onPublish(message: MqttMessage) {
    const { topic, payload } = message;
    if (topic === "v1/gateway/telemetry") {
      // TODO: permission check
      const routeContext = new RouteContext(this.#server);
      await this.#iotPlugin.timeSeriesDataService.createTelemetryValuesOfThings(routeContext, payload as any);
    }
  }
}
