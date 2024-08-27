import { Bindable, BindableBase, BindableManager, BindableMeta, BindableObjectFieldMeta } from "@ruiapp/data-binding-extension";
import { LinkshopAppVariableConfig } from "../linkshop-types";
import { LinkshopAppVariable } from "./LinkshopAppVariable";
import { find } from "lodash";

export class LinkshopAppVariables extends BindableBase<BindableMeta, any> implements Bindable {
  #variablesConfig: LinkshopAppVariableConfig[];
  variables: LinkshopAppVariable[];

  static _bindableMeta: BindableMeta = {
    type: "object",
    fields: [],
  };

  constructor(manager: BindableManager, variablesConfig: LinkshopAppVariableConfig[]) {
    const variables: any = [];
    super(manager, LinkshopAppVariables._bindableMeta, variables);

    this.variables = variables;

    this.#variablesConfig = variablesConfig;
    for (const variableConfig of variablesConfig) {
      this.variables.push(new LinkshopAppVariable(manager, variableConfig));
    }
  }

  get _bindableMeta() {
    const fieldsMeta: BindableObjectFieldMeta[] = [];
    for (const variable of this.variables) {
      const variableMeta = variable._bindableMeta;
      fieldsMeta.push({
        fieldName: variableMeta.name!,
        meta: variableMeta,
      });
    }

    const meta: BindableMeta = {
      type: "object",
      fields: fieldsMeta,
    };

    return meta;
  }

  addVariable(variableConfig: LinkshopAppVariableConfig) {
    this.variables.push(new LinkshopAppVariable(this._bindableManager, variableConfig));
  }

  setVariables(variablesConfig: LinkshopAppVariableConfig[]) {
    this.variables.length = 0;
    for (const variableConfig of variablesConfig) {
      this.variables.push(new LinkshopAppVariable(this._bindableManager, variableConfig));
    }
  }
}

export const linkshopAppVariablesProxyHandler = {
  get(target: LinkshopAppVariables, property: string): any {
    if (
      target.hasOwnProperty(property) ||
      Object.getOwnPropertyDescriptor(target, property) ||
      Object.getOwnPropertyDescriptor((target as any).__proto__, property)
    ) {
      return (target as any)[property];
    }

    const variable: LinkshopAppVariable = find(target.get(), (item: LinkshopAppVariable) => item._bindableMeta.name === property);
    if (variable) {
      return variable.get();
    }
    return undefined;
  },

  set(target: LinkshopAppVariables, property: string, value: any): boolean {
    const variable: LinkshopAppVariable = find(target.get(), (item: LinkshopAppVariable) => item._bindableMeta.name === property);
    if (variable) {
      variable.set(value);
    }
    return true;
  },

  apply(target: any, thisArg: LinkshopAppVariables, argumentsList: any) {
    target.apply(thisArg, argumentsList);
  },
};
