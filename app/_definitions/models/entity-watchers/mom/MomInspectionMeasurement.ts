import { getEntityRelationTargetId, type EntityWatcher, type EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { MomInspectionCharacteristic, MomInspectionMeasurement, type MomInspectionSheet } from "~/_definitions/meta/entity-types";
import { updateInspectionSheetInspectionResult } from "~/services/InspectionSheetService";
import { isCharacterMeasurementValueQualified } from "~/utils/calculate";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_inspection_measurement",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const before = payload.before;

      const measurement = before as Partial<MomInspectionMeasurement>;
      const characteristicId = getEntityRelationTargetId(measurement, "characteristic", "characteristic_id");
      const characteristic = await server.getEntityManager<MomInspectionCharacteristic>("mom_inspection_characteristic").findEntity({
        routeContext,
        filters: [{ operator: "eq", field: "id", value: characteristicId }],
        properties: ["kind", "determineType", "qualitativeDetermineType", "norminal", "upperLimit", "lowerLimit", "upperTol", "lowerTol"],
      });

      if (!characteristic) {
        return;
      }

      // 自动进行测量值合格判定
      before.isQualified = isCharacterMeasurementValueQualified(
        characteristic,
        characteristic.kind === "quantitative" ? measurement.quantitativeValue : measurement.qualitativeValue,
      );
    },
  },
  {
    eventName: "entity.create",
    modelSingularCode: "mom_inspection_measurement",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const after = payload.after;

      await updateInspectionSheetInspectionResult(server, routeContext, after.sheet_id);
    },
  },
  {
    eventName: "entity.beforeUpdate",
    modelSingularCode: "mom_inspection_measurement",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeUpdate">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const { before, changes } = payload;

      // 如果没有修改测量值，不需要重新判断
      if (!changes.hasOwnProperty("qualitativeValue") && !changes.hasOwnProperty("quantitativeValue")) {
        return;
      }

      const characteristicId = getEntityRelationTargetId(before, "characteristic", "characteristic_id");
      const characteristic = await server.getEntityManager<MomInspectionCharacteristic>("mom_inspection_characteristic").findEntity({
        routeContext,
        filters: [{ operator: "eq", field: "id", value: characteristicId }],
        properties: ["kind", "determineType", "qualitativeDetermineType", "norminal", "upperLimit", "lowerLimit", "upperTol", "lowerTol"],
      });

      if (!characteristic) {
        return;
      }

      // 自动进行测量值合格判定
      changes.isQualified = isCharacterMeasurementValueQualified(
        characteristic,
        characteristic.kind === "quantitative" ? changes.quantitativeValue : changes.qualitativeValue,
      );
    },
  },
  {
    eventName: "entity.update",
    modelSingularCode: "mom_inspection_measurement",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const before = payload.before;
      const after = payload.after;
      const changes = payload.changes;

      if (changes.hasOwnProperty("qualitativeValue") || changes.hasOwnProperty("quantitativeValue")) {
        await updateInspectionSheetInspectionResult(server, routeContext, after.sheet_id);
      }

      if (changes.hasOwnProperty("isQualified")) {
        const operationTarget = await server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: after.id,
            },
          ],
          properties: ["id", "sampleCode", "sheet"],
        });

        if (changes) {
          if (ctx?.routerContext?.state.userId) {
            await server.getEntityManager("sys_audit_log").createEntity({
              routeContext,
              entity: {
                user: { id: ctx?.routerContext?.state.userId },
                targetSingularCode: "mom_inspection_characteristic",
                targetSingularName: `检验记录-${operationTarget?.sheet?.code}-样本:${operationTarget?.sampleCode}`,
                method: "update",
                before: before,
                changes: changes,
              },
            });
          }
        }
      }
    },
  },
  {
    eventName: "entity.beforeDelete",
    modelSingularCode: "mom_inspection_measurement",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeDelete">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const before = payload.before;
      try {
        const operationTarget = await server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: before.id,
            },
          ],
          properties: ["id", "sampleCode", "sheet"],
        });
        if (ctx?.routerContext?.state.userId) {
          await server.getEntityManager("sys_audit_log").createEntity({
            routeContext,
            entity: {
              user: { id: ctx?.routerContext?.state.userId },
              targetSingularCode: "mom_inspection_characteristic",
              targetSingularName: `检验记录-${operationTarget?.sheet?.code}-样本:${operationTarget?.sampleCode}`,
              method: "delete",
              before: before,
            },
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
] satisfies EntityWatcher<any>[];
