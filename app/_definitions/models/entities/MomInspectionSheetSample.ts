import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomInspectionSheetSample",
  name: "检验样本",
  description: "检验样本",
  fields: [
    {
      code: "code",
      name: "样本号",
      type: "text",
      required: true,
    },
    {
      code: "sheet",
      name: "检验单",
      type: "relation",
      targetSingularCode: "mom_inspection_sheet",
      targetIdColumnName: "sheet_id",
    },
    {
      code: "measurements",
      name: "检验记录",
      type: "relation[]",
      targetSingularCode: "mom_inspection_measurement",
      selfIdColumnName: "sample_id",
      entityDeletingReaction: "cascadingDelete",
    },
    {
      code: "round",
      name: "检验轮次",
      type: "integer",
      required: true,
      defaultValue: "1",
    },
  ],
};

export default entity;
