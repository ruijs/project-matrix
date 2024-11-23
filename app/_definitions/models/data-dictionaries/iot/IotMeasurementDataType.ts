import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "IotMeasurementDataType",
  name: "测量数据类型",
  valueType: "string",
  level: "app",
  entries: [
    { name: "integer", value: "integer" },
    { name: "long", value: "long" },
    { name: "float", value: "float" },
    { name: "double", value: "double" },
    { name: "boolean", value: "boolean" },
  ],
} as RapidDataDictionary;
