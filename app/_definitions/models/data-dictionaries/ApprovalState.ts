import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "ApprovalState",
  name: "审批状态",
  valueType: "string",
  level: "app",
  entries: [
    { name: "未发起", value: "uninitiated" },
    { name: "审批中", value: "approving", color: "blue" },
    { name: "已批准", value: "approved", color: "green" },
    { name: "已拒绝", value: "rejected", color: "red" },
    { name: "已撤销", value: "canceled" },
  ],
} as RapidDataDictionary;
