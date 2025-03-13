import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomWarehouse",
  name: "仓库",
  softDelete: true,
  fields: [
    {
      code: "building",
      name: "建筑",
      type: "relation",
      targetSingularCode: "base_building",
      targetIdColumnName: "building_id",
    },
    {
      code: "location",
      name: "位置",
      type: "relation",
      targetSingularCode: "base_location",
      targetIdColumnName: "location_id",
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
      code: "orderNum",
      name: "排序号",
      type: "integer",
      required: true,
      defaultValue: "0",
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "EnabledDisabledState",
    },
    {
      code: "externalCode",
      name: "外部编号",
      type: "text",
    },
  ],
};

export default entity;
