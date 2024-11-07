import type { RapidEntity } from "@ruiapp/rapid-extension";
import type { TEntitySingularCodes } from "~/_definitions/meta/model-codes";
import type { TDictionaryCodes } from "~/_definitions/meta/data-dictionary-codes";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  metaOnly: true,
  namespace: "iot",
  code: "IotMachineState",
  name: "机器状态",
  fields: [
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "code",
      name: "编号",
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
      code: "color",
      name: "颜色",
      type: "text",
      required: true,
    },
    {
      code: "isUptime",
      name: "标记为工作中",
      type: "boolean",
      required: false,
    },
    {
      code: "machines",
      name: "已配机器类型",
      type: "relation[]",
      targetSingularCode: "iot_machine_type",
      linkTableName: "iot_machine_type_state_links",
      targetIdColumnName: "machine_type_id",
      selfIdColumnName: "machine_state_id",
    },
  ],
};

export default entity;
