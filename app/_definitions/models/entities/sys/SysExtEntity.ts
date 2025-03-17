import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "sys",
  code: "SysExtEntity",
  name: "外部实体",
  fields: [
    {
      code: "externalTypeCode",
      name: "外部实体类型",
      type: "text",
      required: true,
    },
    {
      code: "externalId",
      name: "外部实体Id",
      type: "text",
      required: true,
    },
    {
      code: "externalCode",
      name: "外部实体编码",
      type: "text",
    },
    {
      code: "externalData",
      name: "外部实体数据",
      type: "json",
    },
    {
      code: "internalTypeCode",
      name: "内部实体类型",
      type: "text",
    },
    {
      code: "internalId",
      name: "内部实体Id",
      type: "text",
    },
    {
      code: "internalCode",
      name: "内部实体编码",
      type: "text",
    },
    {
      code: "syncState",
      name: "同步状态",
      type: "option",
      dataDictionary: "SysExtEntitySyncState",
    },
    {
      code: "syncTime",
      name: "同步时间",
      type: "datetime",
    },
    {
      code: "syncAttempts",
      name: "同步尝试次数",
      type: "integer",
    },
    {
      code: "syncError",
      name: "同步错误信息",
      type: "text",
    },
  ],
  indexes: [
    {
      name: "uidx_sys_ext_entities_type_and_id",
      unique: true,
      properties: [
        {
          code: "externalTypeCode",
        },
        {
          code: "externalId",
        },
      ],
    },
  ],
};

export default entity;
