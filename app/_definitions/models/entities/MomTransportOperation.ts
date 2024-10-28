import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";
import type { PropertySequenceConfig } from "@ruiapp/rapid-core";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomTransportOperation",
  name: "运输单",
  fields: [
    {
      code: "code",
      name: "运输单号",
      type: "text",
      config: {
        sequence: {
          enabled: true,
          config: {
            segments: [
              {
                type: "literal",
                content: "TS-",
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
      code: "applicant",
      name: "申请人",
      type: "relation",
      targetSingularCode: "oc_user",
      targetIdColumnName: "applicant_id",
    },
    {
      code: "items",
      name: "明细项",
      type: "relation[]",
      targetSingularCode: "mom_transport_operation_item",
      selfIdColumnName: "item_id",
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "BusinessInstanceState",
      required: true,
    },
    {
      code: "approvalState",
      name: "审批状态",
      type: "option",
      dataDictionary: "ApprovalState",
    },
    {
      code: "extra",
      name: "其它信息",
      type: "json",
    },
    {
      code: "orderNumb",
      name: "订单号",
      type: "text",
    },
    {
      code: "supplier",
      name: "送货单位",
      type: "text",
    },
    {
      code: "yidaId",
      name: "Yida ID",
      type: "text",
    },
  ],
};

export default entity;
