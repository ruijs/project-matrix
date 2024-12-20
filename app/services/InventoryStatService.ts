import type { EntityFilterOptions, IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import { isNull, isUndefined } from "lodash";

export type StatTableConfig = {
  balanceEntityCode: string;
  logEntityCode: string;
  groupFields: string[];
  quantityBalanceFields: string[];
  quantityChangeFields: string[];
};

export type ChangeInventoryQuantityOptions = {
  balanceEntityCode: string;
  logEntityCode: string;
  quantityBalanceFields: string[];
  quantityChangeFields: string[];
  quantityFieldsToIncrease: string[];
  quantityFieldsToDecrease: string[];
  groupFields: string[];
  groupValues: Record<string, any>;
  change: number;
};

export default class InventoryStatService {
  #server: IRpdServer;

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  async changeInventoryQuantities(routeContext: RouteContext, options: ChangeInventoryQuantityOptions) {
    const {
      balanceEntityCode,
      logEntityCode,
      quantityBalanceFields,
      quantityChangeFields,
      groupFields,
      groupValues,
      quantityFieldsToIncrease,
      quantityFieldsToDecrease,
      change,
    } = options;

    const balanceRecordManager = this.#server.getEntityManager<Record<string, any>>(balanceEntityCode);
    const logRecordManager = this.#server.getEntityManager<Record<string, any>>(logEntityCode);
    const findRecordFilters = groupFields
      .filter((groupField) => !isUndefined(groupValues[groupField]))
      .map((groupField) => {
        const fieldValue = groupValues[groupField];
        if (isNull(fieldValue)) {
          return {
            operator: "null",
            field: groupField,
          } satisfies EntityFilterOptions;
        }

        return {
          operator: "eq",
          field: groupField,
          value: groupValues[groupField],
        } satisfies EntityFilterOptions;
      });
    const balanceRecord = await balanceRecordManager.findEntity({
      routeContext,
      filters: findRecordFilters as any,
    });

    const logRecord: Record<string, any> = {};
    for (const groupField of groupFields) {
      logRecord[groupField] = groupValues[groupField];
    }
    for (const quantityChangeField of quantityChangeFields) {
      logRecord[quantityChangeField] = 0;
    }

    if (balanceRecord) {
      const statChanges: Record<string, number> = {};
      for (const quantityFieldToChange of quantityFieldsToIncrease) {
        if (!quantityBalanceFields.includes(quantityFieldToChange)) {
          continue;
        }
        // TODO: 处理单位换算
        statChanges[quantityFieldToChange] = (balanceRecord[quantityFieldToChange] || 0) + change;
        logRecord[`${quantityFieldToChange}Change`] = change;
      }

      for (const quantityFieldToChange of quantityFieldsToDecrease) {
        if (!quantityBalanceFields.includes(quantityFieldToChange)) {
          continue;
        }
        // TODO: 处理单位换算
        statChanges[quantityFieldToChange] = (balanceRecord[quantityFieldToChange] || 0) - change;
        logRecord[`${quantityFieldToChange}Change`] = 0 - change;
      }

      const savedBalanceRecord = await balanceRecordManager.updateEntityById({
        routeContext,
        id: balanceRecord.id,
        entityToSave: statChanges,
      });

      // 设置变更记录中的余额信息
      logRecord.balanceRecord = balanceRecord.id;
      for (const quantityBalanceField of quantityBalanceFields) {
        logRecord[quantityBalanceField] = savedBalanceRecord[quantityBalanceField];
      }
    } else {
      const statToCreate: Record<string, any> = {};
      for (const groupField of groupFields) {
        statToCreate[groupField] = groupValues[groupField];
      }

      for (const quantityBalanceField of quantityBalanceFields) {
        if (quantityFieldsToIncrease.includes(quantityBalanceField)) {
          statToCreate[quantityBalanceField] = change;
          logRecord[`${quantityBalanceField}Change`] = change;
        } else {
          statToCreate[quantityBalanceField] = 0;
        }
      }

      const savedBalanceRecord = await balanceRecordManager.createEntity({
        routeContext,
        entity: statToCreate,
      });

      // 设置变更记录中的余额信息
      logRecord.balanceRecord = savedBalanceRecord.id;
      for (const quantityBalanceField of quantityBalanceFields) {
        logRecord[quantityBalanceField] = savedBalanceRecord[quantityBalanceField];
      }
    }

    // 保存变更记录
    await logRecordManager.createEntity({
      routeContext,
      entity: logRecord,
    });
  }
}
