import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "IotThing",
  name: "物品",
  description: "",
  fields: [
    {
      code: "type",
      name: "类型",
      type: "relation",
      targetSingularCode: "iot_type",
      targetIdColumnName: "type_id",
    },
    {
      code: "code",
      name: "编号",
      type: "text",
      required: true,
    },
    {
      code: "description",
      name: "描述",
      type: "text",
    },
    {
      code: "attributes",
      name: "属性",
      type: "json",
    },
    {
      code: "state",
      name: "状态",
      required: true,
      type: "option",
      dataDictionary: "EnabledDisabledState",
      defaultValue: "'enabled'",
    },
    {
      code: "gateway",
      name: "网关",
      type: "relation",
      targetSingularCode: "iot_gateway",
      targetIdColumnName: "gateway_id",
    },
    {
      code: "accessToken",
      name: "访问令牌",
      type: "text",
    },
    {
      code: "mqtt_client_id",
      name: "MQTT客户端id",
      type: "text",
    },
  ],
};

export default entity;
