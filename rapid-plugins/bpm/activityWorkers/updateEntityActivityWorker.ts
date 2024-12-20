import type { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import type { ActivityWorker, FinishActivityJobOptions, StartActivityJobOptions, UpdateEntityActivityConfig } from "../BpmPluginTypes";
import { cloneDeep } from "lodash";
import type BpmService from "../BpmService";
import { interpreteActivityConfigExpressions } from "../ExpressionInterpreter";

export default class UpdateEntityActivityWorker implements ActivityWorker {
  #server: IRpdServer;

  #bpmService: BpmService;

  constructor(server: IRpdServer, bpmService: BpmService) {
    this.#server = server;
    this.#bpmService = bpmService;
  }

  async startJob(routeContext: RouteContext, options: StartActivityJobOptions): Promise<void> {
    const { activityNodeConfig, job, processInstance } = options;
    const activityConfig = cloneDeep(activityNodeConfig.activityConfig) as UpdateEntityActivityConfig;

    interpreteActivityConfigExpressions(activityConfig, {
      $processInstance: processInstance,
    });

    if (!activityConfig.entitySingularCode || !activityConfig.entityId) {
      return;
    }

    const entityManager = this.#server.getEntityManager(activityConfig.entitySingularCode);
    await entityManager.updateEntityById({
      routeContext,
      id: activityConfig.entityId,
      entityToSave: activityConfig.entityToSave,
    });

    this.#bpmService.finishActivityJob(routeContext, job, "done", "done");
  }

  async finishJob(routeContext: RouteContext, options: FinishActivityJobOptions): Promise<void> {}
}
