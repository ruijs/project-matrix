import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "SysAuditLogMethod",
  name: "操作方法",
  valueType: "string",
  level: "app",
  entries: [
    { name: "更新", value: "update" },
    { name: "删除", value: "delete" },
  ],
} as RapidDataDictionary;
