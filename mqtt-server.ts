import Aedes from "aedes";
import { createServer } from "net";
import type IotPlugin from "rapid-plugins/iot/IotPlugin";
import type { Logger } from "@ruiapp/rapid-core";

export interface StartMqttServerOptions {
  logger: Logger;
  iotPlugin: IotPlugin;
}

export function startMqttServer(options: StartMqttServerOptions) {
  const { logger, iotPlugin } = options;

  const port = 1883;

  const aedes = new Aedes();
  const server = createServer(aedes.handle);

  aedes.on("publish", async (packet, client) => {
    let payload = packet.payload.toString();
    try {
      payload = JSON.parse(payload);
    } catch (ex) {
      logger.warn("Failed to parse payload as JSON.", {
        topic: packet.topic,
        properties: packet.properties,
        payload,
      });
    }

    const { topic } = packet;
    const mqttMessage = {
      topic,
      payload,
    };
    logger.info("[MQTT] [PUBLISH]", mqttMessage);

    await iotPlugin.mqttMessageHandler.onPublish(mqttMessage);
  });

  server.listen(port, function () {
    console.info("[MQTT] MQTT server started and listening on port ", port);
  });
}
