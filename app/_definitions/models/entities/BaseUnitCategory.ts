import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseUnitCategory",
  name: "单位分组",
  softDelete: true,
  fields: [
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "orderNum",
      name: "排序号",
      type: "integer",
      required: true,
    },
    {
      code: "units",
      name: "单位",
      type: "relation[]",
      targetSingularCode: "base_unit",
      selfIdColumnName: "category_id",
    },
  ],
};

export default entity;
