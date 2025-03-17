import type { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import { EntitySyncContract } from "../EntitySyncPluginTypes";
import { performSyncCycle } from "../EntitySynchronizer";

export default class EntitySyncService {
  #server: IRpdServer;

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  async performSyncCycle(routeContext: RouteContext, contract: EntitySyncContract) {
    await performSyncCycle({
      server: this.#server,
      routeContext,
      contract,
    });
  }
}
