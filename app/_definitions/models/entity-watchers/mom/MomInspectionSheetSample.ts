import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { updateInspectionSheetInspectionResult } from "~/services/InspectionSheetService";

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

      await updateInspectionSheetInspectionResult(server, routeContext, after.sheet_id);
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
        await updateInspectionSheetInspectionResult(server, routeContext, after.sheet_id);
      }
    },
  },
] satisfies EntityWatcher<any>[];
