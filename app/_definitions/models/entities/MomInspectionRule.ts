import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomInspectionRule",
  name: "检验规则",
  description: "设置被检物品在不同检验类型/场景下需要检验哪些特征，各个特征的理论值、合格条件等。",
  fields: [
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "category",
      name: "检验类型",
      type: "relation",
      targetSingularCode: "mom_inspection_category",
      targetIdColumnName: "category_id",
      required: true,
    },
    {
      code: "material",
      name: "物品",
      type: "relation",
      targetSingularCode: "base_material",
      targetIdColumnName: "material_id",
      required: true,
    },
    {
      code: "customer",
      name: "客户",
      type: "relation",
      targetSingularCode: "base_partner",
      targetIdColumnName: "customer_id",
    },
    {
      code: "routeProcess",
      name: "生产工序",
      type: "relation",
      targetSingularCode: "mom_route_process",
      targetIdColumnName: "route_process_id",
    },
    {
      code: "characteristics",
      name: "检验特征",
      type: "relation[]",
      targetSingularCode: "mom_inspection_characteristic",
      selfIdColumnName: "rule_id",
    },
    {
      code: "config",
      name: "配置",
      type: "json",
    },
    {
      code: "isDefault",
      name: "是否默认",
      type: "boolean",
    },
  ],
  // indexes: [
  //   {
  //     unique: true,
  //     properties: ["category", "material", "customer"],
  //   },
  // ],
};

export default entity;
