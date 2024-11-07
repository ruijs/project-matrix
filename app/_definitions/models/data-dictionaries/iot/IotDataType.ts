import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  metaOnly: true,
  code: "IotDataType",
  name: "IoT数据类型",
  valueType: "string",
  entries: [
    { name: "integer", value: "integer" },
    { name: "long", value: "long" },
    { name: "float", value: "float" },
    { name: "double", value: "double" },
    { name: "boolean", value: "boolean" },
    { name: "text", value: "text" },
  ],
} as RapidDataDictionary;
