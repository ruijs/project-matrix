import process from "process";
import Aedes, { AuthenticateError } from "aedes";
import { createServer } from "net";
import type IotPlugin from "rapid-plugins/iot/IotPlugin";
import type { Logger, RapidServer } from "@ruiapp/rapid-core";
import { ParserRegistry, TemperatureHexParser } from "./mqtt-server/parsers";

export interface StartMqttServerOptions {
  rapidServer: RapidServer;
  logger: Logger;
  iotPlugin: IotPlugin;
}

const clients: Map<string, any> = new Map();

const clientManager = {
  registerClient(clientId: string, info: any) {
    clients.set(clientId, info);
  },

  unregisterClient(clientId: string) {
    clients.delete(clientId);
  },

  getClient(clientId: string) {
    return clients.get(clientId);
  },
};

export function startMqttServer(options: StartMqttServerOptions) {
  const { logger, iotPlugin } = options;

  const port = parseInt(process.env.MQTT_PORT || "", 10) || 1883;

  const aedes = new Aedes();
  const mqttServer = createServer(aedes.handle);

  // Initialize parser registry
  const parserRegistry = new ParserRegistry(logger);

  aedes.authenticate = async function (client, username, password, callback) {
    logger.info("[MQTT] [AUTHENTICATE]", { clientId: client.id, username, password });
    try {
      if (!username) {
        const authError = new Error("Authenticate failed: Access token is required.") as AuthenticateError;
        authError.returnCode = 4; //AuthErrorCode.BAD_USERNAME_OR_PASSWORD;
        logger.error(authError.message);
        callback(authError, false);
        return;
      }

      const authResult = await iotPlugin.iotService.authenticateByAccessToken(username);
      if (!authResult.success) {
        const authError = new Error("Authenticate failed: " + authResult.errorMessage) as AuthenticateError;
        authError.returnCode = 4; //AuthErrorCode.BAD_USERNAME_OR_PASSWORD;
        logger.error(authError.message);
        callback(authError, false);
        return;
      }

      clientManager.registerClient(client.id, authResult);
      callback(null, true);
    } catch (ex: any) {
      const authError = new Error("Authenticate failed: " + ex.message) as AuthenticateError;
      logger.error(authError.message);
      authError.returnCode = 3; // AuthErrorCode.SERVER_UNAVAILABLE
      callback(authError, false);
    }
  };

  aedes.on("publish", async (packet, client) => {
    let payload: any;

    const isInWhitelist = !!(client && parserRegistry.isInWhitelist(client.id));

    try {
      if (!packet.topic.startsWith("$SYS/")) {
        if (client && isInWhitelist) {
          const parser = parserRegistry.getParser(client.id);
          payload = parser.parse(packet.payload, client.id);
        } else {
          payload = JSON.parse(packet.payload.toString());
        }
      } else {
        payload = packet.payload;
      }
    } catch (ex: unknown) {
      logger.warn("Failed to parse payload", {
        topic: packet.topic,
        properties: packet.properties,
        payload,
        clientId: client?.id,
        error: (ex as Error).message,
        isInWhitelist: client ? parserRegistry.isInWhitelist(client.id) : false,
      });
    }

    const mqttMessage = {
      clientId: client?.id,
      topic: packet.topic,
      payload,
    };
    logger.info("[MQTT] [PUBLISH]", mqttMessage);

    if (client) {
      const sender = clientManager.getClient(client.id);
      if (sender) {
        await iotPlugin.mqttMessageHandler.onPublish(sender, mqttMessage, isInWhitelist);
      }
    }
  });

  mqttServer.listen(port, function () {
    console.info("[MQTT] MQTT server started and listening on port ", port);
  });
}
