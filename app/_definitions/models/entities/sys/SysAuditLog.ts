import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "sys",
  code: "SysAuditLog",
  name: "系统操作",
  tableName: "sys_audit_logs",
  fields: [
    {
      code: "user",
      name: "操作人",
      type: "relation",
      targetSingularCode: "oc_user",
      targetIdColumnName: "user_id",
    },
    {
      code: "targetSingularCode",
      name: "操作对象",
      type: "text",
    },
    {
      code: "targetSingularName",
      name: "操作对象名称",
      type: "text",
    },
    {
      code: "targetId",
      name: "操作对象Id",
      type: "integer",
    },
    {
      code: "method",
      name: "操作方法",
      type: "option",
      dataDictionary: "SysAuditLogMethod",
    },
    {
      code: "before",
      name: "变更前记录",
      type: "json",
    },
    {
      code: "changes",
      name: "变更记录",
      type: "json",
    },
    {
      code: "after",
      name: "变更后记录",
      type: "json",
    },
  ],
};

export default entity;
