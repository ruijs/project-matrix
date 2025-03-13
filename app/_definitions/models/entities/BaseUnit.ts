import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseUnit",
  name: "单位",
  softDelete: true,
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
      code: "nameEn",
      name: "英文名称",
      type: "text",
    },
    {
      code: "printSymbol",
      name: "打印符号",
      type: "text",
    },
    {
      code: "type",
      name: "类型",
      type: "option",
      dataDictionary: "UnitType",
      required: true,
    },
    {
      code: "orderNum",
      name: "排序号",
      type: "integer",
      required: true,
    },
    {
      code: "category",
      name: "单位分组",
      type: "relation",
      required: true,
      targetSingularCode: "base_unit_category",
      targetIdColumnName: "category_id",
    },
    {
      code: "externalCode",
      name: "外部编号",
      type: "text",
    },
  ],
};

export default entity;
