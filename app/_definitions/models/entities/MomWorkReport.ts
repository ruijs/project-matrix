import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";
import type {PropertySequenceConfig} from "@ruiapp/rapid-core";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomWorkReport",
  name: "生产报工",
  fields: [
    {
      code: "code",
      name: "生产报工号",
      type: "text",
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
      code: "workTask",
      name: "生产任务",
      type: "relation",
      targetSingularCode: "mom_work_task",
      targetIdColumnName: "work_task_id",
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
      code: "tags",
      name: "标签",
      type: "text",
    },
    {
      code: "quantity",
      name: "数量",
      type: "double",
    },
    {
      code: "qualifiedQuantity",
      name: "合格数量",
      type: "double",
    },
    {
      code: "unqualifiedQuantity",
      name: "不合格数量",
      type: "double",
    },
    {
      code: "scrapQuantity",
      name: "报废数量",
      type: "double",
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
    {
      code: "duration",
      name: "工作时长",
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
      code: "operators",
      name: "操作工",
      type: "relation[]",
      targetSingularCode: "base_employee",
      linkTableName: "mom_work_report_operators",
      targetIdColumnName: "operator_id",
      selfIdColumnName: "report_id",
    },
    {
      code: "measurements",
      name: "数采数据",
      type: "relation[]",
      targetSingularCode: "mom_route_process_parameter_measurement",
      linkTableName: "mom_work_report_measurements",
      targetIdColumnName: "measurement_id",
      selfIdColumnName: "report_id",
    },
    {
      code: "extra",
      name: "其它信息",
      type: "json",
    },
    {
      code: "factory",
      name: "工厂",
      type: "relation",
      targetSingularCode: "mom_factory",
      targetIdColumnName: "factory_id",
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
      code: "binNum",
      name: "箱号",
      type: "text",
    },
    {
      code: "executionState",
      name: "执行状态",
      type: "option",
      dataDictionary: "MomWorkTaskExecutionState",
      defaultValue: "processing"
    },
    {
      code: "isOutSpecification",
      name: "是否超差",
      type: "boolean",
      defaultValue: "false",
    },
    {
      code: "feeds",
      name: "投料记录",
      type: "relation[]",
      targetSingularCode: "mom_work_feed",
      selfIdColumnName: "work_report_id",
    },
    {
      code: "serialNum",
      name: "序列号",
      type: "text",
      config: {
        sequence: {
          enabled: true,
          config: {
            segments: [
              {
                type: "literal",
                content: "SN-"
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
                length: 4,
              },
            ],
          },
        } satisfies PropertySequenceConfig,
      },
    },
  ],
  indexes: [
    {
      unique: true,
      properties: ["workOrder", "lotNum"],
    },
  ],
};

export default entity;
