/**
 * Sequence plugin
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
import EventLogService from "./services/EventLogService";

class EventLogPlugin implements RapidPlugin {
  #eventLogService!: EventLogService;

  get code(): string {
    return "eventLog";
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

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    for (const actionHandler of pluginActionHandlers) {
      server.registerActionHandler(this, actionHandler);
    }
  }

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ models: pluginModels });
  }

  async configureServices(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    this.#eventLogService = new EventLogService(server);
    server.registerService("eventLogService", this.#eventLogService);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig) {}

  get printerService() {
    return this.#eventLogService;
  }
}

export default EventLogPlugin;
