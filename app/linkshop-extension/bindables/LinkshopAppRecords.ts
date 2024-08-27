import { Bindable, BindableBase, BindableManager, BindableMeta, BindableObjectFieldMeta } from "@ruiapp/data-binding-extension";
import { LinkshopAppRecordConfig } from "../linkshop-types";
import { LinkshopAppRecord, linkshopAppRecordProxyHandler } from "./LinkshopAppRecord";
import { find } from "lodash";

export class LinkshopAppRecords extends BindableBase<BindableMeta, any> implements Bindable {
  #recordsConfig: LinkshopAppRecordConfig[];
  records: LinkshopAppRecord[];
  _records: LinkshopAppRecord[];

  static _bindableMeta: BindableMeta = {
    type: "object",
    fields: [],
  };

  constructor(manager: BindableManager, recordsConfig: LinkshopAppRecordConfig[]) {
    const records: any = [];
    super(manager, LinkshopAppRecords._bindableMeta, records);

    this._records = [];
    this.records = records;

    this.#recordsConfig = recordsConfig;
    this.setRecords(recordsConfig);
  }

  get _bindableMeta() {
    const fieldsMeta: BindableObjectFieldMeta[] = [];
    for (const record of this.records) {
      const recordMeta = record._bindableMeta;
      fieldsMeta.push({
        fieldName: recordMeta.name!,
        meta: recordMeta,
      });
    }

    const meta: BindableMeta = {
      type: "object",
      fields: fieldsMeta,
    };

    return meta;
  }

  addRecord(recordConfig: LinkshopAppRecordConfig) {
    this.records.push(new LinkshopAppRecord(this._bindableManager, recordConfig));
  }

  setRecords(recordsConfig: LinkshopAppRecordConfig[]) {
    this.records.length = 0;
    for (const recordConfig of recordsConfig) {
      const record = new LinkshopAppRecord(this._bindableManager, recordConfig);
      this.records.push(record);
      this._records.push(new Proxy(record, linkshopAppRecordProxyHandler));
    }
  }

  getRecordByName(recordName: string) {
    return find(this.records, (item: LinkshopAppRecord) => item._bindableMeta.name === recordName);
  }

  initRecord(recordName: string, initialValue: Record<string, any>) {
    const record = this.getRecordByName(recordName);
    if (!record) {
      throw new Error(`Record with name '${recordName}' was not found.`);
    }

    return record.initRecord(initialValue);
  }

  async loadRecord(recordName: string, recordId: number) {
    const record = this.getRecordByName(recordName);
    if (!record) {
      throw new Error(`Record with name '${recordName}' was not found.`);
    }

    return await record.loadRecord(recordId);
  }

  async saveRecord(recordName: string) {
    const record = this.getRecordByName(recordName);
    if (!record) {
      throw new Error(`Record with name '${recordName}' was not found.`);
    }

    return await record.saveRecord();
  }
}

export const linkshopAppRecordsProxyHandler = {
  get(target: LinkshopAppRecords, property: string): any {
    if (
      target.hasOwnProperty(property) ||
      Object.getOwnPropertyDescriptor(target, property) ||
      Object.getOwnPropertyDescriptor((target as any).__proto__, property)
    ) {
      return (target as any)[property];
    }

    return find(target._records, (item: LinkshopAppRecord) => item._bindableMeta.name === property);
  },

  set(target: LinkshopAppRecords, property: string, value: any): boolean {
    const record: LinkshopAppRecord = find(target.get(), (item: LinkshopAppRecord) => item._bindableMeta.name === property);
    if (record) {
      record.set(value);
    }
    return true;
  },

  apply(target: any, thisArg: LinkshopAppRecords, argumentsList: any) {
    target.apply(thisArg, argumentsList);
  },
};
