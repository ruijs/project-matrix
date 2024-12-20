import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { cloneDeep } from "lodash";
import type { BpmInstance, BpmProcess } from "~/_definitions/meta/entity-types";
import { interpreteConfigExpressions } from "~/utils/ExpressionInterpreter";

export type UpdateEntityApprovalTypeConfig = {
  $exps: Record<string, string>;
  entitySingularCode?: string;
  entityId?: number;
  entityToSave?: Record<string, any>;
};

export default [
  {
    eventName: "entity.update",
    modelSingularCode: "bpm_instance",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const changes = payload.changes;

      if (!(changes.hasOwnProperty("state") && changes.state === "finished")) {
        return;
      }

      const processInstance = payload.after as BpmInstance;
      const processId = payload.after.process_id;
      const processManager = server.getEntityManager<BpmProcess>("bpm_process");

      const process = await processManager.findById({ routeContext, id: processId });
      if (!process) {
        return;
      }

      if (process.type === "updateEntityApproval") {
        const updateEntityConfig = cloneDeep(process.typeConfig) as UpdateEntityApprovalTypeConfig;

        interpreteConfigExpressions(updateEntityConfig, {
          $processInstance: processInstance,
        });

        if (!updateEntityConfig.entitySingularCode || !updateEntityConfig.entityId) {
          return;
        }

        const entityManager = server.getEntityManager(updateEntityConfig.entitySingularCode);
        await entityManager.updateEntityById({
          routeContext,
          id: updateEntityConfig.entityId,
          entityToSave: updateEntityConfig.entityToSave,
        });
      }
    },
  },
] satisfies EntityWatcher<any>[];
