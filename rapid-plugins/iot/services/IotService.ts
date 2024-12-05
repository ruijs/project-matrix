import type { IotGateway, IotThing } from "../IotPluginTypes";
import type { IRpdServer, Logger } from "@ruiapp/rapid-core";

export type AuthenticateResult = {
  success: boolean;
  errorMessage?: string;
  gateway?: IotGateway;
  thing?: IotThing;
};

export default class IotService {
  #server: IRpdServer;
  #logger: Logger;

  constructor(server: IRpdServer) {
    this.#server = server;
    this.#logger = server.getLogger();
  }

  async authenticateByAccessToken(accessToken: string): Promise<AuthenticateResult> {
    const gatewayEntityManager = this.#server.getEntityManager<IotGateway>("iot_gateway");

    const gateway = await gatewayEntityManager.findEntity({
      properties: ["id", "state"],
      filters: [
        {
          operator: "eq",
          field: "accessToken",
          value: accessToken,
        },
      ],
      relations: {
        managedThings: {
          properties: ["id", "code"],
        },
      },
    });

    if (gateway) {
      if (gateway.state === "disabled") {
        return {
          success: false,
          errorMessage: `Gateway with code "${gateway.code}" was disabed.`,
        };
      } else {
        return {
          success: true,
          gateway,
        };
      }
    }

    const thingEntityManager = this.#server.getEntityManager<IotThing>("iot_thing");
    const thing = await thingEntityManager.findEntity({
      filters: [
        {
          operator: "eq",
          field: "accessToken",
          value: accessToken,
        },
      ],
    });

    if (thing) {
      if (thing.state === "disabled") {
        return {
          success: false,
          errorMessage: `Thing with code "${thing.code}" was disabed.`,
        };
      } else {
        return {
          success: true,
          thing,
        };
      }
    }

    return {
      success: false,
      errorMessage: "Invalid access token.",
    };
  }
}
