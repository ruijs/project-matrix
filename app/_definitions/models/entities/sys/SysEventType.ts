import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "sys",
  code: "SysEventType",
  name: "事件类型",
  fields: [
    {
      code: "module",
      name: "模块",
      type: "relation",
      targetSingularCode: "sys_module",
      targetIdColumnName: "module_id",
    },
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
      code: "orderNum",
      name: "排序号",
      type: "integer",
      required: true,
      defaultValue: "0",
    },
  ],
  indexes: [
    {
      name: "uidx_sys_event_types_code",
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
