import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomEquipment",
  name: "设备",
  fields: [
    {
      code: "code",
      name: "设备号",
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
      code: "manufacturer",
      name: "生产厂家",
      type: "text",
    },
    {
      code: "model",
      name: "型号",
      type: "text",
    },
    {
      code: "category",
      name: "分类",
      type: "relation",
      targetSingularCode: "mom_equipment_category",
      targetIdColumnName: "category_id",
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "EnabledDisabledState",
      defaultValue: "enabled",
      required: true,
    },
    {
      code: "powerState",
      name: "电源状态",
      type: "option",
      dataDictionary: "MomEquipmentPowerState",
      required: false,
    },
    {
      code: "productionState",
      name: "生产状态",
      type: "option",
      dataDictionary: "MomEquipmentProductionState",
      required: false,
    },
    {
      code: "planedDailyWorkingTime",
      name: "计划每日工作时间",
      type: "integer",
    },
    {
      code: "station",
      name: "所在工位",
      type: "relation",
      targetSingularCode: "mom_station",
      targetIdColumnName: "station_id",
    },
    {
      code: "factory",
      name: "工厂",
      type: "relation",
      targetSingularCode: "mom_factory",
      targetIdColumnName: "factory_id",
    },
    {
      code: "externalCode",
      name: "外部编号",
      type: "text",
    },
    {
      code: "externalId",
      name: "外部ID",
      type: "text",
    },
    {
      code: "machine",
      name: "IOT设备",
      type: "relation",
      targetSingularCode: "iot_machine",
      targetIdColumnName: "machine_id",
    },
  ],
};

export default entity;
