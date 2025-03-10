import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "SysEventSourceType",
  name: "事件来源类型",
  valueType: "string",
  level: "sys",
  entries: [
    { name: "系统", value: "sys" },
    { name: "插件", value: "plugin" },
    { name: "应用", value: "app" },
    { name: "用户", value: "user" },
  ],
} as RapidDataDictionary;
