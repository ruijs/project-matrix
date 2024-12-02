import type { PropertySequenceConfig, PropertyStateMachineConfig } from "@ruiapp/rapid-core";
import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";
import type { PropertyBusinessProcessConfig } from "rapid-plugins/bpm/BpmPluginTypes";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomWorkOrder",
  name: "生产工单",
  description: "管理生产工单/生产订单/生产指令单。一个生产工单可以包含一种产出物。",
  fields: [
    {
      code: "code",
      name: "工单号",
      type: "text",
      config: {
        sequence: {
          enabled: true,
          config: {
            segments: [
              {
                type: "literal",
                content: "W",
              },
              {
                type: "year",
                length: 4,
              },
              {
                type: "month",
                length: 2,
                padding: "0",
              },
              {
                type: "dayOfMonth",
                length: 2,
                padding: "0",
              },
              {
                type: "autoIncrement",
                scope: "",
                period: "day",
                length: 3,
              },
            ],
          },
        } satisfies PropertySequenceConfig,
      },
    },
    {
      code: "mrp",
      name: "物料需求计划",
      type: "relation",
      targetSingularCode: "mom_manufacturing_resource_plan",
      targetIdColumnName: "mrp_id",
    },
    {
      code: "material",
      name: "物品",
      type: "relation",
      targetSingularCode: "base_material",
      targetIdColumnName: "material_id",
    },
    {
      code: "tags",
      name: "标签",
      type: "text",
    },
    {
      code: "lotNum",
      name: "批次号",
      type: "text",
    },
    {
      code: "lot",
      name: "批号信息",
      type: "relation",
      targetSingularCode: "base_lot",
      targetIdColumnName: "lot_id",
    },
    {
      code: "route",
      name: "工艺路线",
      type: "relation",
      targetSingularCode: "mom_route",
      targetIdColumnName: "route_id",
    },
    {
      code: "quantity",
      name: "数量",
      type: "double",
    },
    {
      code: "unit",
      name: "单位",
      type: "relation",
      targetSingularCode: "base_unit",
      targetIdColumnName: "unit_id",
    },
    {
      code: "approvalState",
      name: "审批状态",
      type: "option",
      dataDictionary: "ApprovalState",
      defaultValue: "'uninitiated'",
      config: {
        businessProcess: {
          enabled: true,
          initiateValue: "approving",
          type: "approval",
          name: "生产工单",
          flowConfig: {
            nodes: [
              {
                nodeId: "approval",
                nodeType: "activity",
                nodeTitle: "审批",
                transfers: [
                  {
                    operation: "approve",
                    nextNodeId: "updateApprovalState",
                  },
                  {
                    operation: "reject",
                    nextNodeId: "updateApprovalState",
                  },
                ],
                activityType: "approval",
                activityConfig: {
                  approvalType: "manual",
                  approverType: "specifiedRole",
                  approverRange: {
                    roleCodes: ["PMC"],
                  },
                  approvalResultVarName: "approvalResult",
                  groupDecisionPolicy: "everyone",
                },
              },
              {
                nodeId: "updateApprovalState",
                nodeType: "activity",
                nodeTitle: "更新审批状态",
                transfers: [
                  {
                    operation: "done",
                    nextNodeId: "end",
                  },
                ],
                activityType: "updateEntity",
                activityConfig: {
                  $exps: {
                    entitySingularCode: "$processInstance.entityCode",
                    entityId: "$processInstance.entityId",
                    "entityToSave.state": "$processInstance.variables.approvalResult",
                  },
                },
              },
              {
                nodeId: "end",
                nodeType: "endEvent",
                nodeTitle: "结束",
              },
            ],
          },
          listConfig: {
            listSummaryColumnRenderProps: {
              items: [
                {
                  code: "code",
                  label: "工单号",
                },
                {
                  code: "material",
                  label: "物料",
                },
                {
                  code: "quantity",
                  label: "数量",
                },
              ],
            },
          },
        } satisfies PropertyBusinessProcessConfig,
      },
    },
    {
      code: "assignmentState",
      name: "分配状态",
      type: "option",
      dataDictionary: "MomWorkOrderAssignmentState",
      defaultValue: "'unassigned'",
      config: {
        stateMachine: {
          enabled: true,
          config: {
            initial: "unassigned",
            states: {
              unassigned: {
                on: {
                  assignTask: "assigning",
                },
              },
              assigning: {
                on: {
                  issueOrder: "assigned",
                },
              },
              assigned: {
                on: {
                  recallOrder: "assigning",
                },
              },
              canceled: {
                on: {
                  reopenOrder: "assigning",
                },
              },
            },
          },
        } satisfies PropertyStateMachineConfig,
      },
    },
    {
      code: "executionState",
      name: "执行状态",
      type: "option",
      dataDictionary: "MomWorkOrderExecutionState",
      defaultValue: "'pending'",
      config: {
        stateMachine: {
          enabled: true,
          config: {
            initial: "pending",
            states: {
              pending: {
                on: {
                  startProcess: "processing",
                  cancelOrder: "canceled",
                },
              },
              processing: {
                on: {
                  completeOrder: "completed",
                  cancelOrder: "canceled",
                },
              },
              completed: {
                on: {
                  reopenOrder: "processing",
                },
              },
              canceled: {
                on: {
                  reopenOrder: "processing",
                },
              },
            },
          },
        } satisfies PropertyStateMachineConfig,
      },
    },
    {
      code: "scheduledStartDate",
      name: "计划开始日期",
      type: "date",
    },
    {
      code: "scheduledFinishDate",
      name: "计划完成日期",
      type: "date",
    },
    {
      code: "actualStartDate",
      name: "实际开始日期",
      type: "date",
    },
    {
      code: "actualFinishDate",
      name: "实际完成日期",
      type: "date",
    },
    {
      code: "productionTasks",
      name: "生产任务",
      type: "relation[]",
      targetSingularCode: "mom_work_task",
      selfIdColumnName: "work_order_id",
    },
    {
      code: "workReports",
      name: "生产报工单",
      type: "relation[]",
      targetSingularCode: "mom_work_report",
      selfIdColumnName: "work_order_id",
    },
    {
      code: "inspectionSheets",
      name: "检验单",
      type: "relation[]",
      targetSingularCode: "mom_inspection_sheet",
      selfIdColumnName: "work_task_id",
    },
    {
      code: "feeds",
      name: "投料单",
      type: "relation[]",
      targetSingularCode: "mom_work_feed",
      selfIdColumnName: "work_order_id",
    },
    {
      code: "factory",
      name: "工厂",
      type: "relation",
      targetSingularCode: "mom_factory",
      targetIdColumnName: "factory_id",
    },
    {
      code: "processes",
      name: "工序",
      type: "relation[]",
      targetSingularCode: "mom_process",
      linkTableName: "mom_work_order_processes",
      targetIdColumnName: "process_id",
      selfIdColumnName: "task_id",
    },
    {
      code: "oilMixtureRatio",
      name: "混油比例",
      type: "text",
    },
    {
      code: "oilMixtureRatio1",
      name: "100#油比例(%)",
      type: "float",
    },
    {
      code: "oilMixtureRatio2",
      name: "150BS油比例(%)",
      type: "float",
    },
    {
      code: "paraffinQuantity",
      name: "石蜡油数量(kg)",
      type: "integer",
    },
    {
      code: "stirringTime",
      name: "搅拌时间(分钟)",
      type: "integer",
    },
    {
      code: "stirringPressure",
      name: "搅拌压力(MP)",
      type: "integer",
    },
    {
      code: "tankNumber",
      name: "搅拌罐编号",
      type: "text",
    },
    {
      code: "unloadingVideo",
      name: "卸油视频",
      type: "file",
      config: {
        fileType: "video",
      },
    },
    {
      code: "dcsPicture",
      name: "DCS液位重量照片",
      type: "file",
    },
  ],
};

export default entity;
