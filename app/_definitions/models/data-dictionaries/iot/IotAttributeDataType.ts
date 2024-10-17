import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "IotAttributeDataType",
  name: "属性数据类型",
  valueType: "string",
  level: "app",
  entries: [
    { name: "integer", value: "integer" },
    { name: "long", value: "long" },
    { name: "float", value: "float" },
    { name: "double", value: "double" },
    { name: "text", value: "text" },
    { name: "boolean", value: "boolean" },
    { name: "date", value: "date" },
    { name: "datetime", value: "datetime" },
    { name: "json", value: "json" },
  ],
} as RapidDataDictionary;
