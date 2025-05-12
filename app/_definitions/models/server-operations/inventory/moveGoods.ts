import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import { BaseLocation, MomGoodTransfer, MomInventoryBusinessType, MomInventoryOperation, type MomGood } from "~/_definitions/meta/entity-types";

export type MoveGoodsInput = {
  goodIds: number[];
  locationId: number;
};

// 标识卡拆分操作接口
export default {
  code: "inventory/moveGoods",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext } = ctx;
    const input: MoveGoodsInput = ctx.input;

    await moveGoods(server, routerContext, input);

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;

async function moveGoods(server: IRpdServer, routeContext: RouteContext, input: MoveGoodsInput) {
  const inventoryBusinessTypeManager = server.getEntityManager<MomInventoryBusinessType>("mom_inventory_business_type");
  const inventoryBusinessType = await inventoryBusinessTypeManager.findEntity({
    routeContext,
    filters: [
      {
        operator: "eq",
        field: "operationType",
        value: "organize",
      },
      {
        operator: "eq",
        field: "name",
        value: "移库操作",
      },
    ],
  });

  if (!inventoryBusinessType) {
    throw new Error("未找到名为“移库操作”的库存业务类型。请联系系统管理员进行配置。");
  }

  const locationManager = server.getEntityManager<BaseLocation>("base_location");
  const toLocation = await locationManager.findById({
    routeContext,
    id: input.locationId,
  });

  if (!toLocation) {
    throw new Error("目标库位不存在。");
  }

  const goodManager = server.getEntityManager<MomGood>("mom_good");
  const goods = await goodManager.findEntities({
    routeContext,
    filters: [
      {
        operator: "and",
        filters: [{ operator: "in", field: "id", value: input.goodIds }],
      },
    ],
    properties: ["id", "state", "lotNum", "binNum", "material", "location", "quantity", "manufactureDate", "validityDate", "unit", "putInTime", "lot"],
  });

  // 检查待移动货物的状态是否为normal
  if (goods.some((good) => good.state !== "normal")) {
    throw new Error("只能移动正常状态的货物。");
  }

  const transfers: Partial<MomGoodTransfer>[] = [];
  for (const good of goods) {
    transfers.push({
      binNum: good.binNum,
      from: good.location,
      lot: good.lot,
      lotNum: good.lotNum,
      manufactureDate: good.manufactureDate,
      material: good.material,
      quantity: good.quantity,
      to: toLocation,
      unit: good.unit,
    });
  }

  const inventoryOperation: Partial<MomInventoryOperation> = {
    approvalState: "uninitiated",
    businessType: inventoryBusinessType,
    operationType: "organize",
    state: "done",
    transfers,
  };

  const inventoryOperationManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");
  inventoryOperationManager.createEntity({
    routeContext,
    entity: inventoryOperation,
  });
}
