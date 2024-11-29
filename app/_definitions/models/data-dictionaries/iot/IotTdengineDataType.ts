import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "IotTdengineDataType",
  name: "IoT TDengine 数据类型",
  valueType: "string",
  level: "app",
  entries: [
    { name: "tinyint", value: "tinyint" },
    { name: "tinyint unsigned", value: "tinyint unsigned" },
    { name: "smallint", value: "smallint" },
    { name: "smallint unsigned", value: "smallint unsigned" },
    { name: "int", value: "int" },
    { name: "int unsigned", value: "int unsigned" },
    { name: "long", value: "long" },
    { name: "long unsigned", value: "long unsigned" },
    { name: "float", value: "float" },
    { name: "double", value: "double" },
    { name: "varchar", value: "varchar" },
    { name: "nchar", value: "nchar" },
    { name: "bool", value: "bool" },
    { name: "timestamp", value: "timestamp" },
    { name: "json", value: "json" },
  ],
} as RapidDataDictionary;
