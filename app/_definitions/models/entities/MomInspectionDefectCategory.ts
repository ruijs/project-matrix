import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomInspectionDefectCategory",
  name: "缺陷分类",
  fields: [
    {
      code: "name",
      name: "名称",
      type: "text",
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
      targetSingularCode: "mom_inspection_defect_category",
      targetIdColumnName: "parent_id",
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "EnabledDisabledState",
      required: true,
    },
    {
      code: "defects",
      name: "缺陷",
      type: "relation[]",
      targetSingularCode: "mom_inspection_defect",
      selfIdColumnName: "category_id",
    },
  ],
};

export default entity;
