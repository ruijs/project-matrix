import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomProcess",
  name: "工序",
  fields: [
    {
      code: "code",
      name: "编码",
      type: "text",
    },
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "category",
      name: "工序类型",
      type: "relation",
      targetSingularCode: "mom_process_category",
      targetIdColumnName: "category_id",
    },
    {
      code: "factory",
      name: "工厂",
      type: "relation",
      targetSingularCode: "mom_factory",
      targetIdColumnName: "factory_id",
    },
    {
      code: "orderNum",
      name: "排序号",
      type: "integer",
      required: true,
    },
    {
      code: "standardCycleTime",
      name: "标准周期时间",
      type: "integer",
      description: "以秒为单位",
    },
    {
      code: "equipments",
      name: "生产设备",
      type: "relation[]",
      targetSingularCode: "mom_equipment",
      linkTableName: "mom_process_equipments",
      targetIdColumnName: "equipment_id",
      selfIdColumnName: "process_id",
    },
    {
      code: "outputs",
      name: "产出物料",
      type: "relation[]",
      targetSingularCode: "base_material",
      linkTableName: "mom_process_outputs",
      targetIdColumnName: "material_id",
      selfIdColumnName: "process_id",
    },
    {
      code: "config",
      name: "配置",
      type: "json",
    },
    {
      code: "carModel",
      name: "车型",
      type: "text",
    },
    {
      code: "partNumber",
      name: "零件号",
      type: "text",
    },
    {
      code: "partName",
      name: "零件名",
      type: "text",
    },
    {
      code: "conf",
      name: "配置",
      type: "text",
    },
    {
      code: "partManager",
      name: "零件负责人",
      type: "text",
    },
  ],
};

export default entity;
