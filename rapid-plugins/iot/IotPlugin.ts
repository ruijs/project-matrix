/**
 * Iot plugin
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
import pluginEntityWatchers from "./entityWatchers";
import pluginModels from "./models";
import pluginRoutes from "./routes";
import TimeSeriesDataService from "./services/TimeSeriesDataService";
import MqttMessageHandler from "./MqttMessageHandler";
import TDengineAccessor from "./TDengineAccessor";
import IotService from "./services/IotService";

class IotPlugin implements RapidPlugin {
  #mqttMessageHandler?: MqttMessageHandler;
  #iotService!: IotService;
  #timeSeriesDataService!: TimeSeriesDataService;
  #tDEngineAccessor: TDengineAccessor;

  constructor(tDEngineAccessor: TDengineAccessor) {
    this.#tDEngineAccessor = tDEngineAccessor;
  }

  get code(): string {
    return "iot";
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

  async registerEventHandlers(server: IRpdServer): Promise<any> {
    for (const entityWatcher of pluginEntityWatchers) server.registerEntityWatcher(entityWatcher);
  }

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ models: pluginModels });
  }

  async configureServices(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    this.#iotService = new IotService(server);
    server.registerService("iotService", this.#iotService);

    this.#timeSeriesDataService = new TimeSeriesDataService(server, this.#tDEngineAccessor);
    server.registerService("timeSeriesDataService", this.#timeSeriesDataService);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig) {
    this.#mqttMessageHandler = new MqttMessageHandler(server, this);
  }

  get iotService() {
    return this.#iotService;
  }

  get tDEngineAccessor() {
    return this.#tDEngineAccessor;
  }

  get timeSeriesDataService() {
    return this.#timeSeriesDataService;
  }

  get mqttMessageHandler() {
    return this.#mqttMessageHandler!;
  }
}

export default IotPlugin;
