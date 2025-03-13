import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseMaterial",
  name: "物料",
  softDelete: true,
  fields: [
    {
      code: "code",
      name: "物料号",
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
      code: "brand",
      name: "品牌",
      type: "text",
    },
    {
      code: "specification",
      name: "规格",
      type: "text",
    },
    {
      code: "description",
      name: "描述",
      type: "text",
    },
    {
      code: "category",
      name: "分类",
      type: "relation",
      required: true,
      targetSingularCode: "base_material_category",
      targetIdColumnName: "category_id",
    },
    {
      code: "defaultUnit",
      name: "默认单位",
      type: "relation",
      targetSingularCode: "base_unit",
      targetIdColumnName: "default_unit_id",
    },
    {
      code: "types",
      name: "类型",
      type: "relation[]",
      targetSingularCode: "base_material_type",
      targetIdColumnName: "type_id",
      selfIdColumnName: "material_id",
    },
    {
      code: "canProduce",
      name: "可生产",
      type: "boolean",
    },
    {
      code: "canPurchase",
      name: "可采购",
      type: "boolean",
    },
    {
      code: "canOutsource",
      name: "可外协",
      type: "boolean",
    },
    {
      code: "canSale",
      name: "可销售",
      type: "boolean",
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "EnabledDisabledState",
      required: true,
    },
    {
      code: "isInspectionFree",
      name: "是否免检",
      type: "boolean",
      required: true,
      defaultValue: "false",
    },
    {
      code: "qualityGuaranteePeriod",
      name: "质保期",
      description: "例如：1Y，6M，30D",
      type: "text",
      required: false,
    },
    {
      code: "externalCode",
      name: "外部编号",
      type: "text",
    },
  ],
};

export default entity;
