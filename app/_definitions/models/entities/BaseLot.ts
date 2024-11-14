import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";
import type {PropertySequenceConfig} from "@ruiapp/rapid-core";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "BaseLot",
  name: "批次",
  fields: [
    {
      code: "material",
      name: "物料",
      type: "relation",
      required: true,
      targetSingularCode: "base_material",
      targetIdColumnName: "material_id",
    },
    {
      code: "lotNum",
      name: "批次号",
      type: "text",
      config: {
        sequence: {
          enabled: true,
          config: {
            segments: [
              {
                type: "literal",
                content: "LOT-"
              },
              {
                type: "year",
                length: 4,
              },
              {
                type: "month",
                length: 2,
                padding: "0",
              },
              {
                type: "dayOfMonth",
                length: 2,
                padding: "0",
              },
              {
                type: "autoIncrement",
                scope: "",
                period: "day",
                length: 5,
              },
            ],
          },
        } satisfies PropertySequenceConfig,
      },
    },
    {
      code: "sourceType",
      name: "来源",
      type: "option",
      dataDictionary: "MaterialSourceType",
    },
    {
      code: "manufactureDate",
      name: "生产时间",
      type: "datetime",
    },
    {
      code: "expireTime",
      name: "失效时间",
      type: "datetime",
    },
    {
      code: "validityDate",
      name: "有效期至",
      type: "datetime",
    },
    {
      code: "qualificationState",
      name: "合格证状态",
      type: "option",
      dataDictionary: "QualificationState",
    },
    {
      code: "isAOD",
      name: "是否让步接收",
      type: "boolean",
      defaultValue: "false",
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "BaseLotState",
    },
    {
      code: "treatment",
      name: "处理方式",
      type: "option",
      dataDictionary: "MomInspectionSheetTreatment",
    },
    {
      code: "factory",
      name: "工厂",
      type: "relation",
      targetSingularCode: "mom_factory",
      targetIdColumnName: "factory_id",
    },
    {
      code: "dingtalkProcessInstanceId",
      name: "钉钉审批流程实例ID",
      type: "text",
    },
    {
      code: "dingtalkApprovalOriginator",
      name: "钉钉审批流程发起人",
      type: "text",
    },
    {
      code: "ventilationStartTime",
      name: "通风开始时间",
      type: "datetime",
    },
    {
      code: "ventilationFinishTime",
      name: "通风结束时间",
      type: "datetime",
    },
    {
      code: "ventilationDuration",
      name: "通风时长",
      type: "integer",
    },
  ],
};

export default entity;
