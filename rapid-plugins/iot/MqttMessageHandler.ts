import IotPlugin from "./IotPlugin";

export interface MqttMessage {
  topic: string;
  payload: string | Record<string, any>;
}

export default class MqttMessageHandler {
  #iotPlugin: IotPlugin;

  constructor(iotPlugin: IotPlugin) {
    this.#iotPlugin = iotPlugin;
  }

  async onPublish(message: MqttMessage) {
    const { topic, payload } = message;
    if (topic === "v1/gateway/telemetry") {
      await this.#iotPlugin.timeSeriesDataService.createTelemetryValuesOfDevices(payload as any);
    }
  }
}
