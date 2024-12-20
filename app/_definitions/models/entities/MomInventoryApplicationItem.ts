import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomInventoryApplicationItem",
  name: "库存业务申请货品项",
  fields: [
    {
      code: "application",
      name: "申请信息",
      type: "relation",
      targetSingularCode: "mom_inventory_application",
      targetIdColumnName: "operation_id",
    },
    {
      code: "orderNum",
      name: "排序号",
      type: "integer",
      required: true,
      defaultValue: "0",
    },
    {
      code: "good",
      name: "物品",
      type: "relation",
      targetSingularCode: "mom_good",
      targetIdColumnName: "good_id",
    },
    {
      code: "trackingCode",
      name: "跟踪码",
      type: "text",
    },
    {
      code: "material",
      name: "物品",
      type: "relation",
      targetSingularCode: "base_material",
      targetIdColumnName: "material_id",
    },
    {
      code: "lotNum",
      name: "批号",
      type: "text",
    },
    {
      code: "binNum",
      name: "箱号",
      type: "text",
    },
    {
      code: "serialNum",
      name: "序列号",
      type: "text",
    },
    {
      code: "tags",
      name: "标签",
      type: "text",
    },
    {
      code: "quantity",
      name: "数量",
      type: "double",
    },
    {
      code: "unit",
      name: "单位",
      type: "relation",
      targetSingularCode: "base_unit",
      targetIdColumnName: "unit_id",
    },
    {
      code: "lot",
      name: "批号",
      type: "relation",
      targetSingularCode: "base_lot",
      targetIdColumnName: "lot_id",
    },
    {
      code: "remark",
      name: "备注",
      type: "text",
    },
    {
      code: "acceptQuantity",
      name: "收货数量",
      type: "double",
    },
    {
      code: "acceptPalletCount",
      name: "收货托数",
      type: "double",
    },
    {
      code: "fSourceBillNo",
      name: "源单单号",
      type: "text",
    },
    {
      code: "fSourceTranType",
      name: "源单类型",
      type: "text",
    },
    {
      code: "fOrderBillNo",
      name: "订单单号",
      type: "text",
    },
    {
      code: "fOrderType",
      name: "订单类型",
      type: "text",
    },
    {
      code: "inspectState",
      name: "检验结果",
      type: "option",
      dataDictionary: "InspectionResult",
    },
  ],
};

export default entity;
