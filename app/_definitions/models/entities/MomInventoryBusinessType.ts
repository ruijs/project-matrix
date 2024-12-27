import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomInventoryBusinessType",
  name: "库存业务类型",
  description: "库存操作类型，如：生产入库、领料出库、采购入库、盘点等。",
  fields: [
    {
      code: "operationType",
      name: "库存操作类型",
      type: "option",
      dataDictionary: "MomInventoryOperationType",
      required: true,
    },
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "config",
      name: "配置",
      type: "json",
    },
    {
      code: "businessTypeRoles",
      name: "业务类型",
      type: "relation[]",
      required: true,
      targetSingularCode: "business_type_oc_role",
      selfIdColumnName: "business_type_id",
    },
  ],
};

export default entity;
