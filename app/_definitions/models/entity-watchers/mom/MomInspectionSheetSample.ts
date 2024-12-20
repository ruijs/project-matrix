import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { MomInspectionMeasurement, type MomInspectionSheet } from "~/_definitions/meta/entity-types";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_inspection_sheet_sample",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { payload } = ctx;
      let before = payload.before;

      if (before.measurements && Array.isArray(before.measurements)) {
        before.measurements.forEach((measurement: any) => {
          measurement.sheet_id = before.sheet_id;
          measurement.sampleCode = before.code;
          measurement.round = before.round;
          if (!measurement.locked) {
            measurement.locked = false;
          }
        });
      }
    },
  },
  {
    eventName: "entity.create",
    modelSingularCode: "mom_inspection_sheet_sample",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      let after = payload.after;

      const momInspectionMeasurementManager = server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement");
      const momInspectionMeasurement = await momInspectionMeasurementManager.findEntities({
        routeContext,
        filters: [{ operator: "eq", field: "sheet_id", value: after.sheet_id }],
        properties: ["id", "characteristic", "isQualified", "createdAt", "qualitativeValue", "quantitativeValue"],
      });

      // Get the latest measurement for each characteristic.
      const latestMeasurement = momInspectionMeasurement.reduce((acc, item) => {
        if (item.characteristic?.id && item.createdAt) {
          const characteristicId = item.characteristic.id;

          // @ts-ignore
          if (!acc[characteristicId] || acc[characteristicId].createdAt < item.createdAt) {
            acc[characteristicId] = item;
          }
        }

        return acc;
      }, {} as Record<string, MomInspectionMeasurement>);

      if (Object.values(latestMeasurement).every((item) => item.qualitativeValue !== null || item.quantitativeValue !== null)) {
        const momInspectionSheetManager = server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet");

        let result = "qualified";
        // If any of the latest measurements is unqualified, the sheet is unqualified.
        if (Object.values(latestMeasurement).some((item) => (item.characteristic?.mustPass || false) && item.isQualified !== undefined && !item.isQualified)) {
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
    modelSingularCode: "mom_inspection_sheet_sample",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      let after = payload.after;
      const changes = payload.changes;

      if (changes.hasOwnProperty("isQualified")) {
        const momInspectionMeasurementManager = server.getEntityManager<MomInspectionMeasurement>("mom_inspection_measurement");
        const momInspectionMeasurement = await momInspectionMeasurementManager.findEntities({
          routeContext,
          filters: [{ operator: "eq", field: "sheet_id", value: after.sheet_id }],
          properties: ["id", "characteristic", "isQualified", "createdAt"],
        });

        // Get the latest measurement for each characteristic.
        const latestMeasurement = momInspectionMeasurement.reduce((acc, item) => {
          if (item.characteristic?.id && item.createdAt) {
            const characteristicId = item.characteristic.id;

            // @ts-ignore
            if (!acc[characteristicId] || acc[characteristicId].createdAt < item.createdAt) {
              acc[characteristicId] = item;
            }
          }

          return acc;
        }, {} as Record<string, MomInspectionMeasurement>);

        const momInspectionSheetManager = server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet");

        let result = "qualified";
        // If any of the latest measurements is unqualified, the sheet is unqualified.
        if (Object.values(latestMeasurement).some((item) => (item.characteristic?.mustPass || false) && !item.isQualified)) {
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
] satisfies EntityWatcher<any>[];
