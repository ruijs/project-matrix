import type { RapidEntity } from "@ruiapp/rapid-extension";
import type { TEntitySingularCodes } from "~/_definitions/meta/model-codes";
import type { TDictionaryCodes } from "~/_definitions/meta/data-dictionary-codes";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  metaOnly: true,
  namespace: "iot",
  code: "IotMachineAttributeBind",
  name: "机器属性绑定",
  fields: [
    {
      code: "machineType",
      name: "机器类型",
      type: "relation",
      targetSingularCode: "iot_machine_type",
      targetIdColumnName: "machine_type_id",
      required: true,
    },
    {
      code: "machine",
      name: "机器",
      type: "relation",
      targetSingularCode: "iot_machine",
      targetIdColumnName: "machine_id",
      required: true,
    },
    {
      code: "machineAttribute",
      name: "机器属性",
      type: "relation",
      targetSingularCode: "iot_machine_attribute",
      targetIdColumnName: "machine_attribute_id",
      required: true,
    },
    {
      code: "dataSource",
      name: "数据源",
      type: "relation",
      targetSingularCode: "iot_data_source",
      targetIdColumnName: "data_source_id",
      required: true,
    },
    {
      code: "config",
      name: "配置",
      type: "json",
      required: true,
    },
  ],
  indexes: [
    {
      unique: true,
      properties: ["machineType", "machine", "machineAttribute"],
    },
  ],
};

export default entity;
