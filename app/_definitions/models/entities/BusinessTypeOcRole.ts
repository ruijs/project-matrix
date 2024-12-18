import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BusinessTypeOcRole",
  name: "业务类型角色",
  fields: [
    {
      code: "code",
      name: "编码",
      type: "text",
      required: true,
    },
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "orderNum",
      name: "排序",
      type: "integer",
      required: true,
    },
    {
      code: "roles",
      name: "角色",
      type: "relation[]",
      required: true,
      targetSingularCode: "oc_role",
      linkTableName: "business_type_oc_role_role_links",
      targetIdColumnName: "role_id",
      selfIdColumnName: "role_id",
    },
    {
      code: "businessType",
      name: "业务类型",
      type: "relation",
      targetSingularCode: "mom_inventory_business_type",
      required: true,
    },
  ],
};

export default entity;
