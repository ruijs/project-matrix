/**
 * Entity Sync plugin
 */

import type {
  IRpdServer,
  RapidPlugin,
  RpdApplicationConfig,
  RpdConfigurationItemOptions,
  RpdServerPluginConfigurableTargetOptions,
  RpdServerPluginExtendingAbilities,
} from "@ruiapp/rapid-core";
import pluginActionHandlers from "./actionHandlers";
import pluginModels from "./models";
import pluginRoutes from "./routes";
import EntitySyncService from "./services/EntitySyncService";
import type { EntitySyncContract, EntitySyncPluginInitOptions } from "./EntitySyncPluginTypes";
import { performSyncCycle } from "./EntitySynchronizer";

class EntitySyncPlugin implements RapidPlugin {
  #server!: IRpdServer;
  #entitySyncService!: EntitySyncService;
  #contracts: EntitySyncContract[];

  constructor(options: EntitySyncPluginInitOptions) {
    this.#contracts = options.syncContracts;
  }

  get code(): string {
    return "entitySync";
  }

  get description(): string {
    return "";
  }

  get extendingAbilities(): RpdServerPluginExtendingAbilities[] {
    return [];
  }

  get configurableTargets(): RpdServerPluginConfigurableTargetOptions[] {
    return [];
  }

  get configurations(): RpdConfigurationItemOptions[] {
    return [];
  }

  async initPlugin(server: IRpdServer): Promise<any> {
    this.#server = server;
  }

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    for (const actionHandler of pluginActionHandlers) {
      server.registerActionHandler(this, actionHandler);
    }
  }

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ models: pluginModels });
  }

  async configureServices(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    this.#entitySyncService = new EntitySyncService(server);
    server.registerService("entitySyncService", this.#entitySyncService);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }

  async registerCronJobs() {
    for (const contract of this.#contracts) {
      if (!contract.enabled) {
        continue;
      }

      this.#server.registerCronJob({
        code: `entitySync.${contract.name}`,
        cronTime: contract.jobCronTime,
        description: contract.description,
        async handler(ctx, options) {
          await performSyncCycle({
            server: ctx.server,
            routeContext: ctx.routerContext,
            contract,
          });
        },
      });
    }
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig) {}

  get entitySyncService() {
    return this.#entitySyncService;
  }

  getSyncContracts() {
    return this.#contracts;
  }
}

export default EntitySyncPlugin;
