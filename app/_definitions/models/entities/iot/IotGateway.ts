import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "IotGateway",
  name: "网关",
  description: "",
  fields: [
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
      code: "managedThings",
      name: "管理物品",
      type: "relation[]",
      targetSingularCode: "iot_thing",
      selfIdColumnName: "gateway_id",
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
