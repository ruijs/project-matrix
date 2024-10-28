import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseLotModifyApplication",
  name: "批次",
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
      code: "lot",
      name: "批次号",
      type: "relation",
      targetSingularCode: "base_lot",
      targetIdColumnName: "lot_id",
    },
    {
      code: "originLotNum",
      name: "原始批次号",
      type: "text",
    },
    {
      code: "lotNum",
      name: "新批次号",
      type: "text",
    },
    {
      code: "manufactureDate",
      name: "新生产时间",
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
      code: "approvalState",
      name: "审批状态",
      type: "option",
      dataDictionary: "ApprovalState",
    }
  ],
};

export default entity;
