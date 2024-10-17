/**
 * @deprecated
 */
import type { RapidEntity } from "@ruiapp/rapid-extension";
import type { TEntitySingularCodes } from "~/_definitions/meta/model-codes";
import type { TDictionaryCodes } from "~/_definitions/meta/data-dictionary-codes";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  metaOnly: true,
  namespace: "iot",
  code: "IotMachineType",
  name: "机器类型",
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
      code: "machines",
      name: "已配机器",
      type: "relation[]",
      targetSingularCode: "iot_machine",
      selfIdColumnName: "machine_type_id",
    },
    {
      code: "fields",
      name: "机器字段",
      type: "relation[]",
      targetSingularCode: "iot_machine_field",
      linkTableName: "iot_machine_type_field_links",
      targetIdColumnName: "machine_field_id",
      selfIdColumnName: "machine_type_id",
    },
    {
      code: "attributes",
      name: "机器属性",
      type: "relation[]",
      targetSingularCode: "iot_machine_attribute",
      linkTableName: "iot_machine_type_attribute_links",
      targetIdColumnName: "machine_attribute_id",
      selfIdColumnName: "machine_type_id",
    },
    {
      code: "states",
      name: "机器状态",
      type: "relation[]",
      targetSingularCode: "iot_machine_state",
      linkTableName: "iot_machine_type_state_links",
      targetIdColumnName: "machine_state_id",
      selfIdColumnName: "machine_type_id",
    },
  ],
};

export default entity;
