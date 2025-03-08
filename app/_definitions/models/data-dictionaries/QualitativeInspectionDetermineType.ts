import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "QualitativeInspectionDetermineType",
  name: "判定方式",
  valueType: "string",
  level: "app",
  entries: [
    { name: "合格/不合格", value: "qualified" },
    { name: "是/否", value: "yes" },
    { name: "完成/未完成", value: "done" },
    { name: "能/不能", value: "ok" },
    { name: "有/无", value: "have" },
  ],
} as RapidDataDictionary;
