import type { Framework, IStore, StoreConfigBase, StoreMeta } from "@ruiapp/move-style";
import { EventEmitter } from "@ruiapp/move-style";
import type { LinkshopAppRecordConfig, LinkshopAppVariableConfig } from "../linkshop-types";
import { BindableManager } from "@ruiapp/data-binding-extension";
import { LinkshopAppRuntimeState } from "../bindables/LinkshopAppRuntimeState";

export interface LinkshopAppRuntimeStateStoreConfig extends StoreConfigBase {
  type: "linkshopAppRuntimeStateStore";
  variables?: LinkshopAppVariableConfig[];
  records?: LinkshopAppRecordConfig[];
}

export class LinkshopAppRuntimeStateStore implements IStore<LinkshopAppRuntimeStateStoreConfig> {
  #emitter: EventEmitter;
  #name: string;
  #framework: Framework;
  #config?: LinkshopAppRuntimeStateStoreConfig;
  #bindableManager: BindableManager;
  #runtimeState: LinkshopAppRuntimeState;

  constructor(framework: Framework) {
    this.#name = "";
    this.#emitter = new EventEmitter();
    this.#framework = framework;

    this.#bindableManager = new BindableManager();
    this.#runtimeState = new LinkshopAppRuntimeState(this.#bindableManager, {
      variables: [],
      records: [],
    });
    this.#bindableManager.subscribe(() => {
      this.#emitter.emit("dataChange");
    });
  }

  get name(): string {
    return this.#name;
  }

  setConfig(storeConfig: LinkshopAppRuntimeStateStoreConfig) {
    console.debug(`[RUI][LinkshopAppRuntimeStateStore][${storeConfig.name}] LinkshopAppRuntimeStateStore.setConfig()`);
    this.#name = storeConfig.name;
    this.#config = storeConfig;
    this.#runtimeState.setVariables(storeConfig.variables || []);
    this.#runtimeState.setRecords(storeConfig.records || []);
  }

  async loadData(input?: any): Promise<any> {}

  observe(callback: (data: any) => void) {
    this.#emitter.on("dataChange", callback);
  }

  get data() {
    return this.#runtimeState;
  }

  setPropertyExpression(propName: string, propExpression: string) {}
}

export default {
  type: "linkshopAppRuntimeStateStore",
  store: LinkshopAppRuntimeStateStore,
} as StoreMeta<LinkshopAppRuntimeStateStoreConfig>;
