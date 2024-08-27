import { Bindable, BindableBase, BindableManager, BindableMeta, BindableObjectFieldMeta } from "@ruiapp/data-binding-extension";
import type { LinkshopAppRecordConfig } from "../linkshop-types";
import rapidAppDefinition from "~/rapidAppDefinition";
import { find } from "lodash";
import rapidApi, { rapidApiRequest } from "~/rapidApi";
import { FindEntityOptions } from "@ruiapp/rapid-extension";

function convertBindableMetaFromRecordConfig(variableConfig: LinkshopAppRecordConfig) {
  return {
    type: "object",
    name: variableConfig.name,
    writable: true,
  } as BindableMeta;
}

export class LinkshopAppRecord extends BindableBase<BindableMeta, any> implements Bindable {
  #recordConfig: LinkshopAppRecordConfig;

  static _bindableMeta: BindableMeta = {
    // TODO: convert type
    type: "object",
    fields: [],
  };

  constructor(manager: BindableManager, recordConfig: LinkshopAppRecordConfig) {
    super(manager, convertBindableMetaFromRecordConfig(recordConfig), {});
    this.#recordConfig = recordConfig;
  }

  get _bindableMeta() {
    const entityModel = rapidAppDefinition.entities.find((item) => item.code === this.#recordConfig.entityCode);
    const fieldsMeta: BindableObjectFieldMeta[] = [];
    if (entityModel) {
      for (const property of entityModel.fields) {
        fieldsMeta.push({
          fieldName: property.code!,
          meta: {
            name: property.name,
            type: "string",
            writable: true,
          },
        });
      }
    }

    const meta: BindableMeta = {
      type: "object",
      name: this.#recordConfig.name,
      fields: fieldsMeta,
    };

    return meta;
  }

  initRecord(initialValue: Record<string, any>) {
    this.set(initialValue || {});
  }

  async loadRecord(id: number) {
    const entityCode = this.#recordConfig.entityCode;
    const entity = rapidAppDefinition.entities.find((item) => item.code === entityCode);
    if (!entity) {
      throw new Error(`Entity definition with code '${entityCode}' not found.`);
    }

    const findEntityResult = await rapidApiRequest({
      url: `/${entity.namespace}/${entity.pluralCode}/operations/find`,
      data: {
        filters: [
          {
            operator: "eq",
            field: "id",
            value: id,
          },
        ],
        pagination: {
          offset: 0,
          limit: 1,
        },
      } as FindEntityOptions,
    });

    const record = findEntityResult.result?.list[0];
    if (!record) {
      throw new Error(`Entity with id '${id}' is not found.`);
    }

    this.set(record);
  }

  async saveRecord() {
    const entityCode = this.#recordConfig.entityCode;
    const entity = rapidAppDefinition.entities.find((item) => item.code === entityCode);
    if (!entity) {
      throw new Error(`Entity definition with code '${entityCode}' not found.`);
    }

    let saveRecordResult: any;
    const record = this.get();
    if (record.id) {
      // update
      saveRecordResult = await rapidApiRequest({
        url: `/${entity.namespace}/${entity.pluralCode}/${record.id}`,
        method: "patch",
        data: record,
      });
    } else {
      // create
      saveRecordResult = await rapidApiRequest({
        url: `/${entity.namespace}/${entity.pluralCode}`,
        method: "post",
        data: record,
      });
    }

    this.set(saveRecordResult.result);
  }
}

export const linkshopAppRecordProxyHandler = {
  get(target: LinkshopAppRecord, property: string): any {
    if (
      target.hasOwnProperty(property) ||
      Object.getOwnPropertyDescriptor(target, property) ||
      Object.getOwnPropertyDescriptor((target as any).__proto__, property)
    ) {
      return (target as any)[property];
    }

    return target.get()[property];
  },

  set(target: LinkshopAppRecord, property: string, value: any): boolean {
    if (
      target.hasOwnProperty(property) ||
      Object.getOwnPropertyDescriptor(target, property) ||
      Object.getOwnPropertyDescriptor((target as any).__proto__, property)
    ) {
      (target as any)[property] = value;
      target._bindableManager.notifyChange(target, target.get(), target.get());
      return true;
    }

    target.get()[property] = value;
    target._bindableManager.notifyChange(target, target.get(), target.get());
    return true;
  },

  apply(target: any, thisArg: LinkshopAppRecord, argumentsList: any) {
    target.apply(thisArg, argumentsList);
  },
};
