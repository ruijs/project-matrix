import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "sys",
  code: "SysExtEntityType",
  name: "外部实体类型",
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
      code: "description",
      name: "描述",
      type: "text",
    },
    {
      code: "internalEntityTypeCode",
      name: "内部实体类型",
      type: "text",
    },
    {
      code: "internalEntityExternalIdField",
      name: "外部实体ID字段",
      description: "对应内部实体中表示外部实体ID的字段。",
      type: "text",
    },
    {
      code: "internalEntityExternalCodeField",
      name: "外部实体编号字段",
      description: "对应内部实体中表示外部实体编号的字段。",
      type: "text",
    },
    {
      code: "config",
      name: "配置",
      type: "json",
    },
  ],
  indexes: [
    {
      name: "uidx_sys_ext_entity_types_code",
      unique: true,
      properties: [
        {
          code: "code",
        },
      ],
    },
  ],
};

export default entity;
