import type { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import type { ActivityWorker, ApprovalActivityConfig, FinishActivityJobOptions, StartActivityJobOptions } from "../BpmPluginTypes";
import { OcUser, type BpmManualTask } from "~/_definitions/meta/entity-types";
import { cloneDeep, map, set } from "lodash";
import type BpmService from "../BpmService";

export default class ApprovalActivityWorker implements ActivityWorker {
  #server: IRpdServer;

  #bpmService: BpmService;

  constructor(server: IRpdServer, bpmService: BpmService) {
    this.#server = server;
    this.#bpmService = bpmService;
  }

  async startJob(routeContext: RouteContext, options: StartActivityJobOptions): Promise<void> {
    const { activityNodeConfig, job, processInstance } = options;
    const activityConfig = cloneDeep(activityNodeConfig.activityConfig) as ApprovalActivityConfig;
    if (activityConfig.approvalType === "manual") {
      let tasks: Partial<BpmManualTask>[] = [];

      const { approverType, approverRange } = activityConfig;
      if (approverType === "specifiedUser") {
        const userIds = approverRange.users;
        tasks = map(userIds, (userId) => {
          return {
            job: { id: job.id },
            state: "pending",
            assignee: { id: userId },
          } satisfies Partial<BpmManualTask>;
        });
      } else if (approverType === "specifiedRole") {
        const roleIds = approverRange.roles;
        if (roleIds) {
          const userManager = this.#server.getEntityManager<OcUser>("oc_user");
          const users = await userManager.findEntities({
            routeContext,
            filters: [
              {
                operator: "exists",
                field: "roles",
                filters: [
                  {
                    operator: "in",
                    field: "id",
                    value: roleIds,
                  },
                ],
              },
            ],
          });

          const userIds = map(users, (user) => user.id);
          tasks = map(userIds, (userId) => {
            return {
              job: { id: job.id },
              state: "pending",
              assignee: { id: userId },
            } satisfies Partial<BpmManualTask>;
          });
        }
      } else if (approverType === "initiator") {
        tasks = [
          {
            job: { id: job.id },
            state: "pending",
            assignee: { id: processInstance.initiator?.id || (processInstance as any).initiator_id },
          } satisfies Partial<BpmManualTask>,
        ];
      } else {
        // TODO:
      }

      const taskManager = this.#server.getEntityManager<BpmManualTask>("bpm_manual_task");
      for (const task of tasks) {
        await taskManager.createEntity({
          routeContext,
          entity: task,
        });
      }
    }
  }

  async finishJob(routeContext: RouteContext, options: FinishActivityJobOptions): Promise<void> {
    const { processInstance } = options;
    const activityConfig = options.activityNodeConfig.activityConfig as ApprovalActivityConfig;

    if (!processInstance.variables) {
      processInstance.variables = {};
    }

    set(processInstance.variables, activityConfig.approvalResultVarName, options.jobResolution);

    if (activityConfig.approvalResultVarName) {
      await this.#bpmService.updateProcessInstance(routeContext, {
        id: processInstance.id,
        variables: processInstance.variables,
      });
    }
  }
}
