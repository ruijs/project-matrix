export const getManagerDisplayLabel = (businessTypeName: string, name: string) => {
  switch (businessTypeName) {
    case "销售出库":
      return name === "fFManager" ? "发货" : "保管";
    case "生产入库退货出库":
      return name === "fFManager" ? "验收" : "保管";
    default:
      return name === "fFManager" ? "发料" : "领料";
  }
};
