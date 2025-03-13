import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseLocation",
  name: "位置",
  softDelete: true,
  fields: [
    {
      code: "parent",
      name: "上级位置",
      type: "relation",
      targetSingularCode: "base_location",
      targetIdColumnName: "parent_id",
    },
    {
      code: "type",
      name: "类型",
      type: "option",
      dataDictionary: "BaseLocationType",
      required: true,
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
      required: true,
    },
    {
      code: "description",
      name: "描述",
      type: "text",
    },
    {
      code: "orderNum",
      name: "排序",
      type: "integer",
      required: true,
      defaultValue: "0",
    },
    {
      code: "externalCode",
      name: "外部编码",
      type: "text",
    },
    {
      code: "externalGroupCode",
      name: "外部库位组编码",
      type: "text",
    },
  ],
};

export default entity;
