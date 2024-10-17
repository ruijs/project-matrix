/**
 * @deprecated
 */
import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  metaOnly: true,
  code: "IotTriggerEventType",
  name: "IoT触发器事件类型",
  valueType: "string",
  entries: [
    { name: "指定属性输出时", value: "specifyAttributeOutput" },
    { name: "任意属性输出时", value: "anyAttributeOutput" },
    { name: "机器状态变化时", value: "machineStateChange" },
  ],
} as RapidDataDictionary;
