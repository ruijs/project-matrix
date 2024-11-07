import type { RapidEntity } from "@ruiapp/rapid-extension";
import type { TEntitySingularCodes } from "~/_definitions/meta/model-codes";
import type { TDictionaryCodes } from "~/_definitions/meta/data-dictionary-codes";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  metaOnly: true,
  namespace: "iot",
  code: "IotMachine",
  name: "机器",
  fields: [
    {
      code: "code",
      name: "机器号",
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
      name: "备注",
      type: "text",
      required: false,
    },
    {
      code: "latestFields",
      name: "最新字段",
      type: "json",
      required: false,
    },
    {
      code: "runtimeFields",
      name: "运行时字段",
      type: "json",
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
      code: "state",
      name: "状态",
      type: "relation",
      targetSingularCode: "iot_machine_state",
      targetIdColumnName: "machine_state_id",
      required: false,
    },
  ],
};

export default entity;
