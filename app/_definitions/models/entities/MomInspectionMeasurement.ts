import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomInspectionMeasurement",
  name: "检验记录",
  description: "用来记录对某个样本某个检验特征的一次测量记录，包括使用了什么仪器、检验时间、检验值等信息。",
  fields: [
    {
      code: "sheet",
      name: "检验单",
      type: "relation",
      targetSingularCode: "mom_inspection_sheet",
      targetIdColumnName: "sheet_id",
    },
    {
      code: "sample",
      name: "检验样本",
      type: "relation",
      targetSingularCode: "mom_inspection_sheet_sample",
      targetIdColumnName: "sample_id",
    },
    {
      code: "sampleCode",
      name: "样本号",
      type: "text",
    },
    {
      code: "characteristic",
      name: "检验特征",
      type: "relation",
      targetSingularCode: "mom_inspection_characteristic",
      targetIdColumnName: "characteristic_id",
    },
    {
      code: "instrumentCategory",
      name: "检验仪器类型",
      type: "relation",
      targetSingularCode: "mom_inspection_instrument_category",
      targetIdColumnName: "instrument_category_id",
    },
    {
      code: "instrument",
      name: "检验仪器",
      type: "relation",
      targetSingularCode: "mom_inspection_instrument",
      targetIdColumnName: "instrument_id",
    },
    {
      code: "instrumentCode",
      name: "检验仪器",
      type: "text",
    },
    {
      code: "inspector",
      name: "检验员",
      type: "relation",
      targetSingularCode: "oc_user",
      targetIdColumnName: "inspector_id",
    },
    {
      code: "inspectorName",
      name: "检验员",
      type: "text",
    },
    {
      code: "inspectedAt",
      name: "检验时间",
      type: "datetime",
    },
    {
      code: "qualitativeValue",
      name: "定性检验值",
      type: "text",
    },
    {
      code: "quantitativeValue",
      name: "定量检验值",
      type: "double",
    },
    {
      code: "isQualified",
      name: "是否合格",
      type: "boolean",
    },
    {
      code: "round",
      name: "检验轮次",
      type: "integer",
      required: true,
      defaultValue: "1",
    },
    {
      code: "locked",
      name: "锁定",
      type: "boolean",
    },
    {
      code: "remark",
      name: "备注",
      type: "text",
    },
  ],
};

export default entity;
