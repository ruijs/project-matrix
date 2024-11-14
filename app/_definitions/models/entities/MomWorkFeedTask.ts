import { PropertySequenceConfig } from "@ruiapp/rapid-core";
import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomWorkFeedTask",
  name: "工序任务",
  description: "完成一个生产工单需要执行的若干个生产任务，通常会分配到具体的工序、设备、人员等。",
  fields: [
    {
      code: "code",
      name: "任务号",
      type: "text",
      config: {
        sequence: {
          enabled: true,
          config: {
            segments: [
              {
                type: "literal",
                content: "WFT"
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
      code: "workOrder",
      name: "生产工单",
      type: "relation",
      targetSingularCode: "mom_work_order",
      targetIdColumnName: "work_order_id",
    },
    {
      code: "workTrack",
      name: "生产流转单",
      type: "relation",
      targetSingularCode: "mom_work_track",
      targetIdColumnName: "work_track_id",
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
      code: "route",
      name: "工艺路线",
      type: "relation",
      targetSingularCode: "mom_route",
      targetIdColumnName: "route_id",
    },
    {
      code: "routeProcess",
      name: "生产工序",
      type: "relation",
      targetSingularCode: "mom_route_process",
      targetIdColumnName: "route_process_id",
    },
    {
      code: "process",
      name: "工序",
      type: "relation",
      targetSingularCode: "mom_process",
      targetIdColumnName: "process_id",
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
      code: "equipment",
      name: "设备",
      type: "relation",
      targetSingularCode: "mom_equipment",
      targetIdColumnName: "equipment_id",
    },
    {
      code: "assignees",
      name: "操作工",
      type: "relation[]",
      targetSingularCode: "base_employee",
      linkTableName: "mom_work_task_assignees",
      targetIdColumnName: "assignee_id",
      selfIdColumnName: "task_id",
    },
    {
      code: "deadline",
      name: "最晚完成日期",
      type: "date",
    },
    {
      code: "assigner",
      name: "派工人员",
      type: "relation",
      targetSingularCode: "base_employee",
      targetIdColumnName: "assigner_id",
    },
    {
      code: "assignedAt",
      name: "派工时间",
      type: "datetime",
      defaultValue: "now()",
    },
    {
      code: "acceptedAt",
      name: "领工时间",
      type: "datetime",
    },
    {
      code: "assignmentState",
      name: "分配状态",
      type: "option",
      dataDictionary: "MomWorkTaskAssignmentState",
    },
    {
      code: "executionState",
      name: "执行状态",
      type: "option",
      dataDictionary: "MomWorkTaskExecutionState",
    },
    {
      code: "workReports",
      name: "生产报工单",
      type: "relation[]",
      targetSingularCode: "mom_work_report",
      selfIdColumnName: "work_task_id",
    },
    {
      code: "inspectionSheets",
      name: "检验单",
      type: "relation[]",
      targetSingularCode: "mom_inspection_sheet",
      selfIdColumnName: "work_task_id",
    },
    {
      code: "factory",
      name: "工厂",
      type: "relation",
      targetSingularCode: "mom_factory",
      targetIdColumnName: "factory_id",
    },
    {
      code: "actualStartTime",
      name: "实际开始时间",
      type: "datetime",
    },
    {
      code: "actualFinishTime",
      name: "实际完成时间",
      type: "datetime",
    },
  ],
};

export default entity;
