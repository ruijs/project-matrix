import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "MomInspectionSheetState",
  name: "检验单状态",
  valueType: "string",
  level: "app",
  entries: [
    { name: "待检验", value: "pending", color: "orange" },
    { name: "检验中", value: "inspecting", color: "blue" },
    { name: "检验完成", value: "inspected", color: "green" },
  ],
} as RapidDataDictionary;
