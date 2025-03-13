import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseLot",
  name: "批次",
  softDelete: true,
  fields: [
    {
      code: "material",
      name: "物料",
      type: "relation",
      required: true,
      targetSingularCode: "base_material",
      targetIdColumnName: "material_id",
    },
    {
      code: "lotNum",
      name: "批次号",
      type: "text",
    },
    {
      code: "sourceType",
      name: "来源",
      type: "option",
      dataDictionary: "MaterialSourceType",
    },
    {
      code: "manufactureDate",
      name: "生产时间",
      type: "datetime",
    },
    {
      code: "expireTime",
      name: "失效时间",
      type: "datetime",
    },
    {
      code: "validityDate",
      name: "有效期至",
      type: "datetime",
    },
    {
      code: "qualificationState",
      name: "合格证状态",
      type: "option",
      dataDictionary: "QualificationState",
    },
    {
      code: "isAOD",
      name: "是否让步接收",
      type: "boolean",
      required: true,
      defaultValue: "false",
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "BaseLotState",
    },
    {
      code: "treatment",
      name: "处理方式",
      type: "option",
      dataDictionary: "MomInspectionSheetTreatment",
    },
  ],
};

export default entity;
