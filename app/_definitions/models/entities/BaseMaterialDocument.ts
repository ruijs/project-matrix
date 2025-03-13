import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseMaterialDocument",
  name: "物料文档",
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
      code: "document",
      name: "文档",
      type: "relation",
      required: true,
      targetSingularCode: "ecm_document",
      targetIdColumnName: "document_id",
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "EnabledDisabledState",
      required: true,
    },
  ],
};

export default entity;
