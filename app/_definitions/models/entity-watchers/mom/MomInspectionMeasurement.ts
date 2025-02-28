import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { MomInspectionMeasurement, type MomInspectionSheet } from "~/_definitions/meta/entity-types";
import { updateInspectionSheetInspectionResult } from "~/services/InspectionSheetService";

export default [
  {
    eventName: "entity.create",
    modelSingularCode: "mom_inspection_measurement",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const after = payload.after;

      const momInspectionMeasurementManager = server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement");
      const momInspectionMeasurement = await momInspectionMeasurementManager.findEntities({
        routeContext,
        filters: [{ operator: "eq", field: "sheet_id", value: after.sheet_id }],
        properties: ["id", "characteristic", "isQualified", "createdAt", "qualitativeValue", "quantitativeValue"],
      });

      // Get the latest measurement for each characteristic.
      const latestMeasurement = momInspectionMeasurement.reduce((acc, item) => {
        const characteristicId = item.characteristic?.id;
        if (characteristicId && item.createdAt) {
          if (!acc[characteristicId] || (acc[characteristicId]?.createdAt || 0) < item.createdAt) {
            acc[characteristicId] = item;
          }
        }
        return acc;
      }, {} as Record<string, MomInspectionMeasurement>);

      // 检查是否所有测量值都已完成
      const allMeasurementsComplete = Object.values(latestMeasurement).every((item) => {
        // 根据特性类型检查是否有值
        const characteristic = item.characteristic as { measurementType?: string };
        if (characteristic?.measurementType === 'qualitative') {
          return item.qualitativeValue !== null && item.qualitativeValue !== undefined;
        } else {
          return item.quantitativeValue !== null && item.quantitativeValue !== undefined;
        }
      });

      if (allMeasurementsComplete) {
        const momInspectionSheetManager = server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet");

        let result = "qualified";
        
        // 只检查必检项的合格情况
        const hasUnqualifiedMustPass = Object.values(latestMeasurement).some(
          (item) => item.characteristic?.mustPass && !item.isQualified
        );

        // 如果有必检项不合格，则整体不合格
        if (hasUnqualifiedMustPass) {
          result = "unqualified";
        }

        await momInspectionSheetManager.updateEntityById({
          routeContext,
          id: after.sheet_id,
          entityToSave: {
            result: result,
          },
        });
      }
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

      await updateInspectionSheetInspectionResult(server, routeContext, after.sheet_id);

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
