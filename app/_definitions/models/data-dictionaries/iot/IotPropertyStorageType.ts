import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "IotPropertyStorageType",
  name: "属性存储类型",
  valueType: "string",
  level: "app",
  entries: [
    { name: "测量值", value: "measurement" },
    { name: "数据标签", value: "dataTag" },
    { name: "普通属性", value: "normal" },
  ],
} as RapidDataDictionary;
