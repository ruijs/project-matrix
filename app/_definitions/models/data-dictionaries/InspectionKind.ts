import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "InspectionKind",
  name: "检验类型",
  valueType: "string",
  level: "app",
  entries: [
    { name: "定性检查", value: "qualitative" },
    { name: "定量检查", value: "quantitative" },
  ],
} as RapidDataDictionary;
