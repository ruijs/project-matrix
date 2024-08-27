import { Bindable, BindableBase, BindableManager, BindableMeta, BindableObjectMeta } from "@ruiapp/data-binding-extension";
import { LinkshopAppVariables, linkshopAppVariablesProxyHandler } from "./LinkshopAppVariables";
import type { LinkshopAppRecordConfig, LinkshopAppVariableConfig } from "../linkshop-types";
import { LinkshopAppRecords, linkshopAppRecordsProxyHandler } from "./LinkshopAppRecords";

export type LinkshopAppRuntimeStateConfig = {
  variables: LinkshopAppVariableConfig[];
  records: LinkshopAppRecordConfig[];
};

export class LinkshopAppRuntimeState extends BindableBase<BindableMeta, any> implements Bindable {
  static _bindableMeta: BindableMeta = {
    type: "object",
    fields: [],
  };

  #variables: LinkshopAppVariables;
  #_variables: LinkshopAppVariables;

  #records: LinkshopAppRecords;
  /**
   * proxied records
   */
  #_records: LinkshopAppRecords;

  constructor(manager: BindableManager, config: LinkshopAppRuntimeStateConfig) {
    super(manager, LinkshopAppRuntimeState._bindableMeta, {
      variables: [],
    });

    this.#variables = new LinkshopAppVariables(manager, config.variables);
    this.#_variables = new Proxy(this.#variables, linkshopAppVariablesProxyHandler);

    this.#records = new LinkshopAppRecords(manager, config.records);
    this.#_records = new Proxy(this.#records, linkshopAppRecordsProxyHandler);
  }

  get _bindableMeta() {
    const variablesMetaFields = (this.#variables._bindableMeta as BindableObjectMeta).fields;
    const recordsMetaFields = (this.#records._bindableMeta as BindableObjectMeta).fields;
    const meta: BindableMeta = {
      type: "object",
      fields: [
        {
          fieldName: "variables",
          meta: {
            type: "object",
            name: "应用变量",
            writable: false,
            fields: variablesMetaFields,
          },
        },
        {
          fieldName: "records",
          meta: {
            type: "object",
            name: "数据记录",
            writable: false,
            fields: recordsMetaFields,
          },
        },
        {
          fieldName: "timeElapsedOnApp",
          meta: {
            type: "integer",
            name: "消耗时间",
            writable: true,
          },
        },
      ],
    };

    return meta;
  }

  get variables() {
    return this.#_variables;
  }

  addVariable(variableConfig: LinkshopAppVariableConfig) {
    this.#variables.addVariable(variableConfig);
  }

  setVariables(variablesConfig: LinkshopAppVariableConfig[]) {
    this.#variables.setVariables(variablesConfig);
  }

  get records() {
    return this.#_records;
  }

  addRecord(recordConfig: LinkshopAppRecordConfig) {
    this.#records.addRecord(recordConfig);
  }

  setRecords(recordsConfig: LinkshopAppRecordConfig[]) {
    this.#records.setRecords(recordsConfig);
  }

  getRecordByName(name: string) {
    return this.#records.getRecordByName(name);
  }

  initRecord(recordName: string, initialValue: Record<string, any>) {
    return this.#records.initRecord(recordName, initialValue);
  }

  async loadRecord(recordName: string, recordId: number) {
    return await this.#records.loadRecord(recordName, recordId);
  }

  async saveRecord(recordName: string) {
    return await this.#records.saveRecord(recordName);
  }
}
