import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomTransportOperationItem",
  name: "运输单详情",
  fields: [
    {
      code: "operation",
      name: "申请信息",
      type: "relation",
      targetSingularCode: "mom_transport_operation",
      targetIdColumnName: "operation_id",
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
      name: "罐号",
      type: "text",
    },
    {
      code: "serialNum",
      name: "序列号",
      type: "text",
    },
    {
      code: "sealNum",
      name: "铅封号",
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
      code: "manufacturer",
      name: "生产厂家",
      type: "text",
    },
    {
      code: "deliveryOrderFile",
      name: "送货委托单",
      type: "file",
    },
    {
      code: "qualityInspectionReportFile",
      name: "质检报告",
      type: "file",
    },
    {
      code: "sealNumPicture",
      name: "铅封号照片",
      type: "image",
    },
  ],
};

export default entity;
