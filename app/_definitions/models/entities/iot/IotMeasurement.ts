import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "IotMeasurement",
  name: "测量指标",
  description: "",
  fields: [
    {
      code: "type",
      name: "所属类型",
      type: "relation",
      targetSingularCode: "iot_type",
      targetIdColumnName: "type_id",
    },
    {
      code: "dataType",
      name: "数据类型",
      type: "option",
      dataDictionary: "IotMeasurementDataType",
      required: true,
    },
    {
      code: "code",
      name: "编码",
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
      code: "dataLength",
      name: "长度",
      type: "integer",
      required: true,
      defaultValue: "0",
    },
    {
      code: "unit",
      name: "计量单位",
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
      code: "orderNum",
      name: "排序号",
      type: "integer",
      required: true,
      defaultValue: "0",
    },
  ],
};

export default entity;
