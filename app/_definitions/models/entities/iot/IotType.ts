import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "IotType",
  name: "类型",
  description: "",
  fields: [
    {
      code: "code",
      name: "编号",
      type: "text",
      required: true,
    },
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "description",
      name: "描述",
      type: "text",
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
      code: "attributes",
      name: "属性",
      type: "relation[]",
      targetSingularCode: "iot_attribute",
      selfIdColumnName: "type_id",
    },
    {
      code: "measurements",
      name: "测量指标",
      type: "relation[]",
      targetSingularCode: "iot_measurement",
      selfIdColumnName: "type_id",
    },
  ],
};

export default entity;
