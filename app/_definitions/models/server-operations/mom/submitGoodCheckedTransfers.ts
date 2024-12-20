import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import type { MomGood, MomInventoryCheckRecord, MomInventoryOperation, SaveMomInventoryCheckRecordInput } from "~/_definitions/meta/entity-types";

export type CreateGoodOutTransferInput = {
  operationId: number;
  materialId: number;
  shelves: {
    binNum: string;
  }[];
};

// PDA入库操作接口
export default {
  code: "submitGoodCheckRecords",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: CreateGoodOutTransferInput = ctx.input;

    await submitGoodCheckRecords(server, routeContext, input);

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;

async function submitGoodCheckRecords(server: IRpdServer, routeContext: RouteContext, input: CreateGoodOutTransferInput) {
  const inventory = await findInventoryOperation(server, routeContext, input.operationId);

  if (!inventory) throw new Error("未找到对应的库存操作");

  for (const shelve of input.shelves) {
    const goods = await findGoods(server, routeContext, input, shelve.binNum);

    if (goods) {
      for (const good of goods) {
        await createGoodCheckRecord(server, routeContext, input.operationId, good);
      }
    }
  }
}

async function findInventoryOperation(server: IRpdServer, routeContext: RouteContext, operationId: number) {
  const inventoryManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");
  return await inventoryManager.findEntity({
    routeContext,
    filters: [{ operator: "eq", field: "id", value: operationId }],
    properties: ["id", "businessType"],
  });
}

async function findGoods(server: IRpdServer, routeContext: RouteContext, input: CreateGoodOutTransferInput, binNum: string) {
  const goodManager = server.getEntityManager<MomGood>("mom_good");
  return await goodManager.findEntities({
    routeContext,
    filters: [
      { operator: "eq", field: "material_id", value: input.materialId },
      { operator: "eq", field: "bin_num", value: binNum },
    ],
    properties: ["id", "material", "unit", "location", "quantity", "lotNum", "binNum", "validityDate", "lot", "state"],
  });
}

async function createGoodCheckRecord(server: IRpdServer, routeContext: RouteContext, operationId: number, good: MomGood) {
  const goodCheckManager = server.getEntityManager<MomInventoryCheckRecord>("mom_inventory_check_record");

  let savedGoodCheckRecord = {
    operation: { id: operationId },
    material: { id: good.material?.id },
    lotNum: good.lotNum,
    binNum: good.binNum,
    good: { id: good.id },
    quantity: good.quantity,
    unit: { id: good.unit?.id },
    orderNum: 1,
  } as SaveMomInventoryCheckRecordInput;

  if (good.location) {
    savedGoodCheckRecord = {
      ...savedGoodCheckRecord,
      location: { id: good.location?.id },
    };
  }

  if (good.lot) {
    savedGoodCheckRecord = {
      ...savedGoodCheckRecord,
      lot: { id: good.lot.id },
    };
  }

  await goodCheckManager.createEntity({
    routeContext,
    entity: savedGoodCheckRecord,
  });
}
