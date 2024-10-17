/**
 * @deprecated
 */
import type { RapidEntity } from "@ruiapp/rapid-extension";
import type { TEntitySingularCodes } from "~/_definitions/meta/model-codes";
import type { TDictionaryCodes } from "~/_definitions/meta/data-dictionary-codes";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  metaOnly: true,
  namespace: "iot",
  code: "IotMachineTrigger",
  name: "机器触发器",
  fields: [
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "description",
      name: "备注",
      type: "text",
      required: false,
    },
    {
      code: "machineType",
      name: "机器类型",
      type: "relation",
      targetSingularCode: "iot_machine_type",
      targetIdColumnName: "machine_type_id",
      required: true,
    },
    {
      code: "eventType",
      name: "事件类型",
      type: "option",
      required: true,
      dataDictionary: "IotTriggerEventType",
    },
    {
      code: "eventValue",
      name: "事件触发配置",
      type: "json",
      required: true,
    },
    {
      code: "eventAction",
      name: "事件脚本配置",
      type: "json",
      required: true,
    },
    {
      code: "isEnabled",
      name: "是否启用",
      type: "boolean",
      required: false,
      defaultValue: "true",
    },
    {
      code: "orderNum",
      name: "排序",
      type: "integer",
      required: true,
    },
  ],
};

export default entity;
