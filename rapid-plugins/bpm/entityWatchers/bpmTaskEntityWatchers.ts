import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import type { BpmManualTask } from "~/_definitions/meta/entity-types";
import type BpmService from "../BpmService";

export default [
  {
    eventName: "entity.update",
    modelSingularCode: "bpm_manual_task",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;

      const bpmService = server.getService<BpmService>("bpmService");

      const changes: Partial<BpmManualTask> = payload.changes;
      const after: Partial<BpmManualTask> = payload.after;

      console.log("bpm_manual_task update", payload);
      if (changes.state === "finished") {
        bpmService.checkApprovalJobState(routeContext, (after as any).job_id);
      }
    },
  },
] satisfies EntityWatcher<any>[];
