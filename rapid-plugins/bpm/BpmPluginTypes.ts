import { RouteContext } from "@ruiapp/rapid-core";
import type { BpmInstance, BpmJob } from "~/_definitions/meta/entity-types";

export type PropertyBusinessProcessConfig = {
  enabled: boolean;
  /**
   * 当属性值变为`initiateValue`时，发起审批流程。
   */
  initiateValue: string;

  /**
   * 用于对流程进行分类，开发人员可根据类型信息进行流程启动前后、流程完成前后的扩展开发。
   */
  type: string;

  /**
   * 流程名称。如果不设置，则默认取实体名称。
   */
  name?: string;

  /**
   * 流程配置。
   */
  flowConfig: BusinessProcessFlowConfig;

  /**
   * 列表配置。
   */
  listConfig: BusinessProcessListConfig;
};

export type BusinessProcessFlowConfig = {
  nodes: FlowNode[];
};

export type BusinessProcessListConfig = {
  listSummaryColumnRenderProps: {
    items: {
      code: string;
      label: string;
    }[];
  };
};

export type CreateProcessInstanceInput = {
  title: string;
  processCode: string;
  initiator: number;
  entityCode?: string;
  entityId?: number;
  formData: Record<string, any>;
  variables: Record<string, any>;
  state: string;
};

export type StartProcessInstanceInput = {
  instanceId: number;
  processId: number;
};

export type UpdateProcessInstanceOptions = Pick<BpmInstance, "id" | "formData" | "variables" | "currentJob">;

export type FlowConfig = {
  nodes?: FlowNode[];
};

export type FlowNodeTransfer = {
  operation: string;
  nextNodeId: string;
};

export type StartActivityJobOptions = {
  job: BpmJob;
  activityNodeConfig: ActivityFlowNode;
  processInstance: BpmInstance;
};

export type FinishActivityJobOptions = {
  job: any;
  activityNodeConfig: ActivityFlowNode;
  processInstance: BpmInstance;
  jobResolution?: ActivityJobResolution;
};

export interface ActivityWorker {
  startJob(routeContext: RouteContext, options: StartActivityJobOptions): Promise<void>;
  finishJob(routeContext: RouteContext, options: FinishActivityJobOptions): Promise<void>;
}

export type FlowNode = StartEventFlowNode | EndEventFlowNode | ActivityFlowNode;

export type StartEventFlowNode = {
  nodeType: "startEvent";
  nodeId: string;
  nodeTitle?: string;
  transfers: FlowNodeTransfer[];
};

export type EndEventFlowNode = {
  nodeType: "endEvent";
  nodeId: string;
  nodeTitle?: string;
};

export type ActivityFlowNode = ApprovalActivityFlowNode | UpdateEntityActivityFlowNode;

export type ActivityFlowNodeBase = {
  nodeType: "activity";
  nodeId: string;
  nodeTitle?: string;
  transfers: FlowNodeTransfer[];
};

export type ApprovalActivityFlowNode = ActivityFlowNodeBase & {
  activityType: "approval";
  activityConfig: ApprovalActivityConfig;
};

export type ApprovalActivityConfig = {
  $exps?: Record<string, string>;

  /**
   * 审批类型。manual表示人工审批。
   */
  approvalType: "manual";

  /**
   * 用户保存审批结果的变量名。
   */
  approvalResultVarName: string;

  /**
   * 审批人类型。specifiedUser 表示指定用户；specifiedRole 表示指定角色；initiator 表示发起人。
   */
  approverType: "specifiedUser" | "specifiedRole" | "initiator";
  approverRange: {
    users?: number[];
    roles?: number[];
    roleCodes?: string[];
  };
  /**
   * 多人审批策略。everyone表示会签，anyone表示或签，sequence表示串签/依次审批。
   */
  groupDecisionPolicy: "everyone" | "anyone" | "sequence";
};

export type ActivityJobOperation = ServiceJobOperation | ApprovalJobOperation;

export type ServiceJobOperation = "done";

export type ApprovalJobOperation = "approve" | "reject";

export type ActivityJobResolution = ServiceJobResolution | ApprovalJobResolution;

export type ServiceJobResolution = "done";

export type ApprovalJobResolution = "approved" | "rejected" | "canceled";

export type ApprovalTaskResolution = "approved" | "rejected" | "canceled" | "autoApproved" | "autoRejected";

export type UpdateEntityActivityFlowNode = ActivityFlowNodeBase & {
  activityType: "updateEntity";
  activityConfig: UpdateEntityActivityConfig;
};

export type UpdateEntityActivityConfig = {
  $exps?: Record<string, string>;
  entitySingularCode?: string;
  entityId?: number;
  entityToSave?: Record<string, any>;
};
