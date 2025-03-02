import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomInspectionCommonCharacteristic",
  name: "通用检验特征",
  description: "通用的检验特征或者检验项目。",
  softDelete: true,
  fields: [
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
      name: "排序号",
      type: "integer",
      required: true,
      defaultValue: "0",
    },
    {
      code: "category",
      name: "特征类型",
      type: "relation",
      targetSingularCode: "mom_inspection_characteristic_category",
      targetIdColumnName: "category_id",
    },
    {
      code: "config",
      name: "配置",
      type: "json",
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "EnabledDisabledState",
      defaultValue: "'enabled'",
    },
  ],
  indexes: [
    {
      name: "uidx_mom_inspection_common_characteristic_name",
      unique: true,
      properties: [
        {
          code: "name",
        },
      ],
    },
  ],
};

export default entity;
