import type { TDictionaryCodes } from "../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "mom",
  code: "MomMaterialInventoryBalance",
  name: "库存量-按物品分组",
  description: "记录某一种物品的数量",
  fields: [
    {
      code: "material",
      name: "物品",
      type: "relation",
      targetSingularCode: "base_material",
      targetIdColumnName: "material_id",
    },
    {
      code: "tags",
      name: "标签",
      type: "text",
    },
    {
      code: "unit",
      name: "单位",
      type: "relation",
      targetSingularCode: "base_unit",
      targetIdColumnName: "unit_id",
    },
    {
      code: "availableQuantity",
      name: "可用数量",
      description: "可用数量，包括在单和在库，但未被预定的数量。",
      type: "double",
    },
    {
      code: "allocableQuantity",
      name: "可分配数量",
      description: "可分配数量，包括在库但未被预定的数量。",
      type: "double",
    },
    {
      code: "onOrderQuantity",
      name: "在单数量",
      description: "已经下单购买或者生产的数量",
      type: "double",
    },
    {
      code: "intransitQuantity",
      name: "采购在途数量",
      description: "采购已发货在途的数量",
      type: "double",
    },
    {
      code: "onHandQuantity",
      name: "在库数量",
      description: "在仓库中的数量，包括已被预订或分配的数量。",
      type: "double",
    },
    {
      code: "reservedQuantity",
      name: "已预定数量",
      description:
        "客户订单审核通过预定的成品数量；或者生产工单审核通过预定的原料数量。已预定数量和在库数量无关，在库数量不一定大于等于已预定数量。一旦销售发货单或者生产领料单审核通过，应该扣减掉对应的已预定数量，增加对应的已分配数量。",
      type: "double",
    },
    {
      code: "allocatedQuantity",
      name: "已分配数量",
      description:
        "销售发货单已经批准但还没有发货的成品数量；或者生产领料单已经审核通过但还未领料的数量。已分配数量和在库数量无关，在库数量不一定大于等于已分配数量。一旦订单开始发货，或者完成了生产领料，应该扣减掉对应的已分配数量和在库数量。",
      type: "double",
    },
    {
      code: "shippingQuantity",
      name: "销售在途数量",
      description: "正在发往客户途中的数量。一旦运达，应该扣减相应的已发货数量，增加相应的已交付数量。",
      type: "double",
    },
    {
      code: "config",
      name: "配置",
      type: "text",
    },
    {
      code: "partManager",
      name: "零件负责人",
      type: "text",
    },
  ],
};

export default entity;
