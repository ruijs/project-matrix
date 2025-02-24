export const renderInventoryManagerDisplayLabel = (businessTypeName: string, fieldName: string) => {
  switch (businessTypeName) {
    case "销售出库":
      return fieldName === "fFManager" ? "发货" : "保管";
    case "生产入库退货出库":
      return fieldName === "fFManager" ? "验收" : "保管";
    default:
      return fieldName === "fFManager" ? "发料" : "领料";
  }
};
