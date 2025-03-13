import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseMaterialCategory",
  name: "物料分类",
  softDelete: true,
  fields: [
    {
      code: "code",
      name: "编号",
      type: "text",
      required: false,
    },
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "defaultUnit",
      name: "默认单位",
      type: "relation",
      targetSingularCode: "base_unit",
      targetIdColumnName: "default_unit_id",
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
      targetSingularCode: "base_material_category",
      targetIdColumnName: "parent_id",
    },
    {
      code: "materials",
      name: "物料",
      type: "relation[]",
      targetSingularCode: "base_material",
      selfIdColumnName: "category_id",
    },
    {
      code: "externalCode",
      name: "外部编号",
      type: "text",
    },
    {
      code: "printTemplate",
      name: "打印模版",
      type: "relation",
      targetSingularCode: "mom_print_template",
      targetIdColumnName: "print_template_id",
    },
  ],
};

export default entity;
