import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomInspectionCategory",
  name: "检验类型",
  description: "检验类型，如：来料检验、出货检验、生产过程检验等。",
  fields: [
    {
      code: "code",
      name: "Code",
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
      name: "排序号",
      type: "integer",
    },
    {
      code: "parent",
      name: "上级分类",
      type: "relation",
      targetSingularCode: "mom_inspection_category",
      targetIdColumnName: "parent_id",
    },
  ],
};

export default entity;
