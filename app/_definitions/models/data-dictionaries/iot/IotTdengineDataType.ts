import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "IotTdengineDataType",
  name: "IoT TDengine 数据类型",
  valueType: "string",
  level: "app",
  entries: [
    { name: "smallint", value: "smallint" },
    { name: "int", value: "int" },
    { name: "long", value: "long" },
    { name: "float", value: "float" },
    { name: "double", value: "double" },
    { name: "varchar", value: "varchar" },
    { name: "nchar", value: "nchar" },
    { name: "boolean", value: "boolean" },
    { name: "timestamp", value: "timestamp" },
    { name: "json", value: "json" },
  ],
} as RapidDataDictionary;
