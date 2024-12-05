import { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import IotPlugin from "./IotPlugin";
import { IotGateway, IotThing } from "./types/IotModelsTypes";
import { TelemetryValuesOfThings } from "./IotPluginTypes";

export interface MqttMessageSender {
  gateway?: IotGateway;
  thing?: IotThing;
}

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

  async onPublish(sender: MqttMessageSender, message: MqttMessage) {
    const { topic } = message;
    const payload = message.payload as TelemetryValuesOfThings;
    if (topic === "v1/gateway/telemetry") {
      const gateway = sender.gateway;
      if (!gateway || gateway.state === "disabled") {
        return;
      }

      // Check gateway-thing bindings
      const unmanagedThingCodes: string[] = [];
      const telemetryValuesOfThings: TelemetryValuesOfThings = {};

      const managedThings: IotThing[] = gateway.managedThings || [];
      for (const thingCode in payload) {
        if (managedThings.find((item) => item.code === thingCode)) {
          telemetryValuesOfThings[thingCode] = payload[thingCode];
        } else {
          unmanagedThingCodes.push(thingCode);
        }
      }

      if (unmanagedThingCodes.length) {
        this.#server
          .getLogger()
          .warn("Telemetry values of these things are ignored, because they are not managed by this gateway: " + unmanagedThingCodes.join(", "));
      }

      if (Object.keys(telemetryValuesOfThings).length) {
        const routeContext = new RouteContext(this.#server);
        await this.#iotPlugin.timeSeriesDataService.createTelemetryValuesOfThings(routeContext, telemetryValuesOfThings);
      }
    } else if (topic === "v1/thing/telemetry") {
      if (!sender || !sender.thing || sender.thing.state === "disabled") {
        return;
      }
      const routeContext = new RouteContext(this.#server);

      const thingCode = "";
      await this.#iotPlugin.timeSeriesDataService.createTelemetryValuesOfThings(routeContext, {
        [thingCode]: payload as any,
      });
    }
  }
}
