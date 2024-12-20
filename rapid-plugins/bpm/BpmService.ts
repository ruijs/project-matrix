import type { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import type {
  ActivityFlowNode,
  ActivityJobOperation,
  ActivityJobResolution,
  ApprovalActivityFlowNode,
  ApprovalJobOperation,
  ApprovalJobResolution,
  CreateProcessInstanceInput,
  FlowConfig,
  StartProcessInstanceInput,
  UpdateProcessInstanceOptions,
} from "./BpmPluginTypes";
import type { BpmManualTask, BpmJob, BpmInstance, BpmProcess, SaveBpmJobInput, SaveBpmManualTaskInput } from "~/_definitions/meta/entity-types";
import { getNowStringWithTimezone } from "~/utils/time-utils";
import { countBy, filter, find, first, map } from "lodash";
import ApprovalActivityWorker from "./activityWorkers/approvalActivityWorker";
import { createActivityWorker } from "./ActivityWorkerFactory";

export default class BpmService {
  #server: IRpdServer;

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  async createProcessInstance(routeContext: RouteContext, input: CreateProcessInstanceInput) {
    const processManager = this.#server.getEntityManager<BpmProcess>("bpm_process");
    const process = await processManager.findEntity({
      routeContext,
      filters: [
        {
          operator: "eq",
          field: "code",
          value: input.processCode,
        },
      ],
    });
    if (!process) {
      throw new Error(`Process with code '${input.processCode}' was not found.`);
    }

    const instanceManager = this.#server.getEntityManager<BpmInstance>("bpm_instance");
    const processInstance = await instanceManager.createEntity({
      routeContext,
      entity: {
        title: input.title,
        process: process.id,
        initiator: input.initiator,
        entityCode: input.entityCode,
        entityId: input.entityId,
        formData: input.formData,
        variables: input.variables,
        initiatedAt: getNowStringWithTimezone(),
        state: "processing",
      } as Partial<BpmInstance>,
    });

    await this.#startProcessInstance(routeContext, processInstance, {
      instanceId: processInstance.id,
      processId: processInstance.process.id!,
    });

    return processInstance;
  }

  async #startProcessInstance(routeContext: RouteContext, processInstance: BpmInstance, input: StartProcessInstanceInput) {
    const processManager = this.#server.getEntityManager<BpmProcess>("bpm_process");
    const process = await processManager.findById({ routeContext, id: input.processId });
    const flowConfig: FlowConfig = process?.flowConfig || {};

    const flowNodes = flowConfig.nodes || [];
    // TODO: should find startEvent node.
    const activityNode = first(flowNodes) as ActivityFlowNode;
    if (!activityNode) {
      return;
    }

    await this.startActivityJob(routeContext, processInstance, activityNode);
  }

  async checkApprovalJobState(routeContext: RouteContext, jobId: number) {
    const taskManager = this.#server.getEntityManager<BpmManualTask>("bpm_manual_task");
    const tasks = await taskManager.findEntities({
      routeContext,
      filters: [
        {
          operator: "eq",
          field: "job_id",
          value: jobId,
        },
      ],
    });

    const jobManager = this.#server.getEntityManager<BpmJob>("bpm_job");
    const job = await jobManager.findById({
      routeContext,
      id: jobId,
      keepNonPropertyFields: true,
    });
    if (!job) {
      return;
    }

    const instanceManager = this.#server.getEntityManager<BpmInstance>("bpm_instance");
    const processInstance = await instanceManager.findById({
      routeContext,
      id: job.instance?.id || (job as any).instance_id,
      keepNonPropertyFields: true,
    });
    if (!processInstance) {
      return;
    }

    const processManager = this.#server.getEntityManager<BpmProcess>("bpm_process");
    const process = await processManager.findById({
      routeContext,
      id: processInstance.process?.id || (processInstance as any).process_id,
      keepNonPropertyFields: true,
    });
    if (!process) {
      return;
    }

    const flowConfig: FlowConfig = process.flowConfig || {};
    const activityNodeConfig = find(flowConfig.nodes, { nodeId: job.flowNodeId }) as ApprovalActivityFlowNode | null;
    if (!activityNodeConfig) {
      throw new Error("job.flowNodeId is invalid.");
    }

    let canFinishJob = false;
    let jobOperation: ApprovalJobOperation = "approve";
    let jobResolution: ApprovalJobResolution = "approved";

    const pendingTasks = filter(tasks, (task: BpmManualTask) => task.state === "pending");
    const groupDecisionPolicy = activityNodeConfig.activityConfig.groupDecisionPolicy;
    if (groupDecisionPolicy === "anyone") {
      // 或签审批。任意一个人通过，或者所有人都拒绝时，可以结束审批任务。
      if (pendingTasks.length === 0) {
        canFinishJob = true;
        const approvedTask = find(tasks, { resolution: "approved" });
        if (approvedTask) {
          jobOperation = "approve";
          jobResolution = "approved";
        } else {
          jobOperation = "reject";
          jobResolution = "rejected";
        }
      } else {
        const approvedTask = find(tasks, { resolution: "approved" });
        if (approvedTask) {
          jobOperation = "approve";
          jobResolution = "approved";
          canFinishJob = true;
        } else {
          jobOperation = "reject";
          jobResolution = "rejected";
        }
      }
    } else if (groupDecisionPolicy === "everyone") {
      // 会签审批。需要所有人都提交后，才可以结束审批任务。
      if (pendingTasks.length === 0) {
        const approvedTasks = filter(tasks, { resolution: "approved" });
        if (approvedTasks.length === tasks.length) {
          jobOperation = "approve";
          jobResolution = "approved";
        } else {
          jobOperation = "reject";
          jobResolution = "rejected";
        }
      }
    } else {
      // TODO: decide resolution when `groupDecisionPolicy === "sequence"`.
    }

    if (canFinishJob) {
      await this.finishActivityJob(routeContext, job, jobOperation, jobResolution);
    }
  }

  async startActivityJob(routeContext: RouteContext, processInstance: BpmInstance, activityNode: ActivityFlowNode) {
    const jobManager = this.#server.getEntityManager<BpmJob>("bpm_job");
    if (activityNode.nodeType === "activity") {
      const job = await jobManager.createEntity({
        routeContext,
        entity: {
          instance: { id: processInstance.id },
          activityType: activityNode.activityType,
          name: activityNode.nodeTitle || activityNode.activityType,
          flowNodeId: activityNode.nodeId,
          state: "pending",
          startedAt: getNowStringWithTimezone(),
        } satisfies SaveBpmJobInput,
      });

      const activityWorker = createActivityWorker(activityNode.activityType, this.#server, this);
      await activityWorker.startJob(routeContext, {
        activityNodeConfig: activityNode,
        job: job,
        processInstance: processInstance,
      });

      processInstance.currentJob = { id: job.id };
      await this.updateProcessInstance(routeContext, processInstance);
    }
  }

  async finishActivityJob(routeContext: RouteContext, job: BpmJob, jobOperation: ActivityJobOperation, jobResolution: ActivityJobResolution) {
    const instanceManager = this.#server.getEntityManager<BpmInstance>("bpm_instance");
    const processInstance = await instanceManager.findById({
      routeContext,
      id: job.instance?.id || (job as any).instance_id,
      keepNonPropertyFields: true,
    });
    if (!processInstance) {
      return;
    }

    const processManager = this.#server.getEntityManager<BpmProcess>("bpm_process");
    const process = await processManager.findById({
      routeContext,
      id: processInstance.process?.id || (processInstance as any).process_id,
      keepNonPropertyFields: true,
    });
    if (!process) {
      return;
    }

    const flowConfig: FlowConfig = process.flowConfig || {};
    const activityNodeConfig = find(flowConfig.nodes, { nodeId: job.flowNodeId }) as ActivityFlowNode | null;
    if (!activityNodeConfig) {
      throw new Error("job.flowNodeId is invalid.");
    }

    const transferConfig = find(activityNodeConfig.transfers, { operation: jobOperation });
    if (!transferConfig) {
      throw new Error("job resolution is invalid.");
    }

    const nextActivityNodeConfig = find(flowConfig.nodes, { nodeId: transferConfig.nextNodeId });
    if (!nextActivityNodeConfig) {
      throw new Error("transfers[].nextNodeId is invalid.");
    }

    const activityWorker = createActivityWorker(activityNodeConfig.activityType, this.#server, this);
    await activityWorker.finishJob(routeContext, {
      job,
      processInstance,
      activityNodeConfig,
      jobResolution: jobResolution,
    });

    const jobManager = this.#server.getEntityManager<BpmJob>("bpm_job");
    await jobManager.updateEntityById({
      routeContext,
      id: job.id,
      entityToSave: {
        state: "finished",
        completedAt: getNowStringWithTimezone(),
        resolution: jobResolution,
      } satisfies Partial<BpmJob>,
    });

    if (nextActivityNodeConfig.nodeType === "activity") {
      await this.startActivityJob(routeContext, processInstance, nextActivityNodeConfig);
    } else if (nextActivityNodeConfig.nodeType === "endEvent") {
      await this.finishProcessInstance(routeContext, processInstance);
    }
  }

  async updateProcessInstance(routeContext: RouteContext, options: UpdateProcessInstanceOptions) {
    const instanceManager = this.#server.getEntityManager<BpmInstance>("bpm_instance");
    const entityToSave: Partial<BpmInstance> = {};
    if (options.formData) {
      entityToSave.formData = options.formData;
    }
    if (options.variables) {
      entityToSave.variables = options.variables;
    }
    if (options.currentJob) {
      entityToSave.currentJob = options.currentJob;
    }

    await instanceManager.updateEntityById({
      routeContext,
      id: options.id,
      entityToSave,
    });
  }

  async finishProcessInstance(routeContext: RouteContext, instance: BpmInstance) {
    const instanceManager = this.#server.getEntityManager<BpmInstance>("bpm_instance");
    await instanceManager.updateEntityById({
      routeContext,
      id: instance.id,
      entityToSave: {
        state: "finished",
        completedAt: getNowStringWithTimezone(),
      } satisfies Partial<BpmInstance>,
    });
  }
}
