/**
 * @deprecated
 */
import type { RapidEntity } from "@ruiapp/rapid-extension";
import type { TEntitySingularCodes } from "~/_definitions/meta/model-codes";
import type { TDictionaryCodes } from "~/_definitions/meta/data-dictionary-codes";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  metaOnly: true,
  namespace: "iot",
  code: "IotMachineField",
  name: "机器字段",
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
      code: "dataType",
      name: "数据类型",
      type: "option",
      required: true,
      dataDictionary: "IotAttributeDataType",
    },
    {
      code: "machines",
      name: "已配机器类型",
      type: "relation[]",
      targetSingularCode: "iot_machine_type",
      linkTableName: "iot_machine_type_field_links",
      targetIdColumnName: "machine_type_id",
      selfIdColumnName: "machine_field_id",
    },
    {
      code: "clearOnNew",
      name: "新纪录时置空",
      type: "boolean",
      required: false,
    },
  ],
};

export default entity;
