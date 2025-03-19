import { getEntityRelationTargetId, type EntityWatcher, type EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { refreshInspectionSheetInspectionResult } from "~/services/InspectionSheetService";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_inspection_sheet_sample",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { payload } = ctx;
      let before = payload.before;

      if (before.measurements && Array.isArray(before.measurements)) {
        const inspectionSheetId = getEntityRelationTargetId(before, "sheet", "sheet_id");
        before.measurements.forEach((measurement: any) => {
          measurement.sheet_id = inspectionSheetId;
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

      const inspectionSheetId = getEntityRelationTargetId(after, "sheet", "sheet_id");
      await refreshInspectionSheetInspectionResult(server, routeContext, inspectionSheetId);
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
        const inspectionSheetId = getEntityRelationTargetId(after, "sheet", "sheet_id");
        await refreshInspectionSheetInspectionResult(server, routeContext, inspectionSheetId);
      }
    },
  },
  {
    eventName: "entity.beforeUpdate",
    modelSingularCode: "mom_inspection_sheet_sample",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeUpdate">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const before = payload.before;
      const changes = payload.changes;

      if (changes.measurements && Array.isArray(changes.measurements)) {
        const inspectionSheetId = getEntityRelationTargetId(before, "sheet", "sheet_id");
        changes.measurements.forEach((measurement: any) => {
          measurement.sheet_id = inspectionSheetId;
          measurement.sampleCode = before.code;
          measurement.round = before.round;
          if (!measurement.locked) {
            measurement.locked = false;
          }
        });
      }
    },
  },
] satisfies EntityWatcher<any>[];
