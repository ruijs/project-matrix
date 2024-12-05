import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "IotPropertyDataType",
  name: "属性数据类型",
  valueType: "string",
  level: "app",
  entries: [
    { name: "tiny", value: "tiny" },
    { name: "unsigned_tiny", value: "unsigned_tiny" },
    { name: "small", value: "small" },
    { name: "unsigned_small", value: "unsigned_small" },
    { name: "integer", value: "integer" },
    { name: "unsigned_integer", value: "unsigned_integer" },
    { name: "long", value: "long" },
    { name: "unsigned_long", value: "unsigned_long" },
    { name: "float", value: "float" },
    { name: "double", value: "double" },
    { name: "text", value: "text" },
    { name: "ntext", value: "ntext" },
    { name: "boolean", value: "boolean" },
    { name: "date", value: "date" },
    { name: "datetime", value: "datetime" },
    { name: "json", value: "json" },
  ],
} as RapidDataDictionary;
