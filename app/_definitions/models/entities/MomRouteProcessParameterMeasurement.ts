import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomRouteProcessParameterMeasurement",
  name: "设备数采记录",
  fields: [
    {
      code: "factory",
      name: "工厂",
      type: "relation",
      targetSingularCode: "mom_factory",
      targetIdColumnName: "factory_id",
    },
    {
      code: "equipment",
      name: "设备",
      type: "relation",
      targetSingularCode: "mom_equipment",
      targetIdColumnName: "equipment_id",
    },
    {
      code: "process",
      name: "工序",
      type: "relation",
      targetSingularCode: "mom_process",
      targetIdColumnName: "process_id",
    },
    {
      code: "workOrder",
      name: "生产工单",
      type: "relation",
      targetSingularCode: "mom_work_order",
      targetIdColumnName: "work_order_id",
    },
    {
      code: "workReport",
      name: "生产报工",
      type: "relation",
      targetSingularCode: "mom_work_report",
      targetIdColumnName: "work_report_id",
    },
    {
      code: "parameter",
      name: "工艺参数",
      type: "relation",
      targetSingularCode: "mom_route_process_parameter",
      targetIdColumnName: "parameter_id",
    },
    {
      code: "dimension",
      name: "数采参数",
      type: "relation",
      targetSingularCode: "mom_equipment_category_dimension",
      targetIdColumnName: "dimension_id",
    },
    {
      code: "nominal",
      name: "标准值",
      type: "double",
    },
    {
      code: "upperLimit",
      name: "上限值",
      type: "double",
    },
    {
      code: "lowerLimit",
      name: "下限值",
      type: "double",
    },
    {
      code: "value",
      name: "实际值",
      type: "double",
    },
    {
      code: "isOutSpecification",
      name: "是否超标",
      type: "boolean",
    },
    {
      code: "isReported",
      name: "是否已上报Yida",
      type: "boolean",
      defaultValue: "false"
    },
    {
      code: "fawCode",
      name: "配置",
      type: "text",
    },
  ],
};

export default entity;
