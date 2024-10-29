import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";
import type {PropertySequenceConfig} from "@ruiapp/rapid-core";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomInventoryOperation",
  name: "库存操作记录",
  description: "对物品库存操作的一次记录，一次操作可包含多个物品的转移记录。",
  fields: [
    {
      code: "code",
      name: "编号",
      type: "text",
      config: {
        sequence: {
          enabled: true,
          config: {
            segments: [
              {
                type: "literal",
                content: "WO-"
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
                length: 3,
              },
            ],
          },
        } satisfies PropertySequenceConfig,
      },
    },
    {
      code: "operationType",
      name: "操作类型",
      type: "option",
      dataDictionary: "MomInventoryOperationType",
      required: true,
    },
    {
      code: "businessType",
      name: "业务类型",
      type: "relation",
      targetSingularCode: "mom_inventory_business_type",
      targetIdColumnName: "business_id",
    },
    {
      code: "application",
      name: "申请单信息",
      type: "relation",
      targetSingularCode: "mom_inventory_application",
      targetIdColumnName: "application_id",
    },
    {
      code: "businessDetails",
      name: "业务详情",
      type: "json",
    },
    {
      code: "state",
      name: "操作状态",
      type: "option",
      dataDictionary: "MomInventoryOperationState",
    },
    {
      code: "approvalState",
      name: "审批状态",
      type: "option",
      dataDictionary: "ApprovalState",
    },
    {
      code: "transfers",
      name: "变更明细",
      type: "relation[]",
      targetSingularCode: "mom_good_transfer",
      selfIdColumnName: "operation_id",
    },
    {
      code: "warehouse",
      name: "仓库",
      type: "relation",
      targetSingularCode: "base_location",
      targetIdColumnName: "warehouse_id",
    },
    {
      code: "contractNum",
      name: "合同号",
      type: "text",
    },
    {
      code: "productionPlanSn",
      name: "生产计划单号",
      type: "text",
    },
    {
      code: "supplier",
      name: "供应商",
      type: "relation",
      targetSingularCode: "base_partner",
      targetIdColumnName: "partner_id",
    },
    {
      code: "customer",
      name: "客户",
      type: "relation",
      targetSingularCode: "base_partner",
      targetIdColumnName: "customer_id",
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
      code: "shop",
      name: "车间",
      type: "text",
    },
    {
      code: "department",
      name: "部门",
      type: "relation",
      targetSingularCode: "oc_department",
      targetIdColumnName: "department_id",
    },
    {
      code: "finishedMaterial",
      name: "成品物料(用途)",
      type: "relation",
      targetSingularCode: "base_material",
      targetIdColumnName: "finished_material_id",
    },
    {
      code: "supplier",
      name: "供应商",
      type: "relation",
      targetSingularCode: "base_partner",
      targetIdColumnName: "supplier_id",
    },
    {
      code: "processed",
      name: "是否处理",
      type: "boolean",
      defaultValue: "false"
    },
  ],
};

export default entity;
