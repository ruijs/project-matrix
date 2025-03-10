import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "SysEventLogLevel",
  name: "日志级别",
  valueType: "string",
  level: "sys",
  entries: [
    { name: "信息", value: "info", color: "blue" },
    { name: "警告", value: "warn", color: "orange" },
    { name: "错误", value: "error", color: "red" },
    { name: "严重", value: "crit", color: "red" },
    { name: "紧急", value: "emerg", color: "red" },
  ],
} as RapidDataDictionary;
