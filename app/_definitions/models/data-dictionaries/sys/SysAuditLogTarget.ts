import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "SysAuditLogTarget",
  name: "操作对象",
  valueType: "string",
  level: "app",
  entries: [
    { name: "物料", value: "base_material" },
    { name: "库存申请单", value: "mom_inventory_application" },
    { name: "库存操作单", value: "mom_inventory_operation" },
    { name: "检验单", value: "mom_inspection_sheet" },
    { name: "检验规则", value: "mom_inspection_rule" },
    { name: "检验特征", value: "mom_inspection_characteristic" },
    { name: "检验记录", value: "mom_inspection_measurement" },
    { name: "库存操作记录", value: "mom_good_transfer" },
  ],
} as RapidDataDictionary;
