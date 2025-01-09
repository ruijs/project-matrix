import process from "process";
import Aedes, { AuthenticateError } from "aedes";
import { createServer } from "net";
import type IotPlugin from "rapid-plugins/iot/IotPlugin";
import type { Logger, RapidServer } from "@ruiapp/rapid-core";
import { ParserRegistry, TemperatureHexParser } from './parsers';

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
  
  // Register parsers for specific clients
  const clientIds = [
    '020062748395',
    '048071690794',
    '020062733850',
    '048071682353',
    '374064830385',
    '048071687451',
    '551052823440',
    '713075467134',
    'F0FE6B000A67',
    '020062767080'
  ];

  // Register temperature parser for each client
  clientIds.forEach(clientId => {
    parserRegistry.registerParser(clientId, new TemperatureHexParser(logger));
    parserRegistry.addToWhitelist(clientId);
  });

  aedes.authenticate = async function (client, username, password, callback) {
    try {
      if (!username) {
        const authError = new Error("Authenticate failed: Access token is required.") as AuthenticateError;
        authError.returnCode = 4; //AuthErrorCode.BAD_USERNAME_OR_PASSWORD;
        callback(authError, false);
        return;
      }

      const authResult = await iotPlugin.iotService.authenticateByAccessToken(username);
      if (!authResult.success) {
        const authError = new Error("Authenticate failed: " + authResult.errorMessage) as AuthenticateError;
        authError.returnCode = 4; //AuthErrorCode.BAD_USERNAME_OR_PASSWORD;
        callback(authError, false);
        return;
      }

      clientManager.registerClient(client.id, authResult);
      callback(null, true);
    } catch (ex: any) {
      const authError = new Error("Authenticate failed: " + ex.message) as AuthenticateError;
      authError.returnCode = 3; // AuthErrorCode.SERVER_UNAVAILABLE
      callback(authError, false);
    }
  };

  aedes.on("publish", async (packet, client) => {
    let payload = packet.payload.toString();
    
    try {
      if (client && parserRegistry.isInWhitelist(client.id)) {
        // 只有在白名单中的客户端才使用特殊解析器
        const parser = parserRegistry.getParser(client.id);
        payload = parser.parse(payload);
      } else {
        // 非白名单客户端或无客户端时使用 JSON 解析
        payload = JSON.parse(payload);
      }
    } catch (ex) {
      logger.warn("Failed to parse payload", {
        topic: packet.topic,
        properties: packet.properties,
        payload,
        clientId: client?.id,
        error: ex.message,
        isInWhitelist: client ? parserRegistry.isInWhitelist(client.id) : false
      });
    }

    const mqttMessage = {
      topic: packet.topic,
      payload,
    };
    logger.info("[MQTT] [PUBLISH]", mqttMessage);

    if (client) {
      const sender = clientManager.getClient(client.id);
      if (sender) {
        await iotPlugin.mqttMessageHandler.onPublish(sender, mqttMessage);
      }
    }
  });

  mqttServer.listen(port, function () {
    console.info("[MQTT] MQTT server started and listening on port ", port);
  });
}
