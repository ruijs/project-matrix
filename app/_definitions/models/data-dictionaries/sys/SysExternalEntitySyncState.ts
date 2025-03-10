import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "SysExternalEntitySyncState",
  name: "同步结果",
  valueType: "string",
  level: "sys",
  entries: [
    { name: "等待同步", value: "pending" },
    { name: "正在同步", value: "processing", color: "blue" },
    { name: "成功", value: "success", color: "green" },
    { name: "失败", value: "failed", color: "red" },
  ],
} as RapidDataDictionary;
