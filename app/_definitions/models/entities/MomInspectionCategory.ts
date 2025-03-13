import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomInspectionCategory",
  name: "检验类型",
  description: "检验类型，如：来料检验、出货检验、生产过程检验等。",
  softDelete: true,
  fields: [
    {
      code: "code",
      name: "编码",
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
    {
      code: "notificationSubscribers",
      name: "通知用户",
      type: "relation[]",
      targetSingularCode: "oc_user",
      linkTableName: "mom_inspection_category_subscribers",
      targetIdColumnName: "user_id",
      selfIdColumnName: "category_id",
    },
    {
      code: "config",
      name: "配置",
      type: "json",
    },
  ],
};

export default entity;
