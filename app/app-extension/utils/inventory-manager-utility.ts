export const renderInventoryManagerDisplayLabel = (businessTypeName: string, fieldName: string) => {
  switch (businessTypeName) {
    case "销售出库":
    case "销售退货入库":
      return fieldName === "fFManager" ? "发货" : "保管";
    case "采购入库":
    case "采购退货出库":
    case "生产入库":
    case "生产入库退货出库":
    case "委外加工入库":
    case "其它原因入库":
      return fieldName === "fFManager" ? "验收" : "保管";
    default:
      return fieldName === "fFManager" ? "发料" : "领料";
  }
};
