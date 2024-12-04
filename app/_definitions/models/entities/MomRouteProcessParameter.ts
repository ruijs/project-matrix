import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomRouteProcessParameter",
  name: "工艺参数",
  fields: [
    {
      code: "route",
      name: "工艺流程",
      type: "relation",
      targetSingularCode: "mom_route",
      targetIdColumnName: "route_id",
    },
    {
      code: "orderNum",
      name: "排序号",
      type: "integer",
    },
    {
      code: "process",
      name: "生产工序",
      type: "relation",
      required: true,
      targetSingularCode: "mom_process",
      targetIdColumnName: "process_id",
    },
    {
      code: "equipment",
      name: "设备",
      type: "relation",
      targetSingularCode: "mom_equipment",
      targetIdColumnName: "equipment_id",
    },
    {
      code: "dimension",
      name: "数采指标",
      type: "relation",
      targetSingularCode: "mom_equipment_category_dimension",
      targetIdColumnName: "dimension_id",
    },
    {
      code: "config",
      name: "配置",
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
      code: "code",
      name: "编码",
      type: "text",
    },
    {
      code: "name",
      name: "名称",
      type: "text",
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
      code: "fawCode",
      name: "配置",
      type: "text",
    },
  ],
};

export default entity;
