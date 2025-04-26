import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import type {
  MomGood,
  MomGoodLocation,
  MomGoodTransfer,
  MomInventoryOperation,
  SaveMomGoodInput,
  SaveMomGoodLocationInput,
  SaveMomGoodTransferInput,
} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";

export type CreateGoodOutTransferInput = {
  operationId: number;
  materialId: number;
  lotNum: string;
  shelves: {
    binNum: string;
  }[];
};

// PDA入库操作接口
export default {
  code: "submitGoodOutTransfers",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: CreateGoodOutTransferInput = ctx.input;

    await submitGoodOutTransfers(server, routeContext, input);

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;

export async function submitGoodOutTransfers(server: IRpdServer, routeContext: RouteContext, input: CreateGoodOutTransferInput) {
  const inventory = await findInventoryOperation(server, routeContext, input.operationId);

  if (!inventory) throw new Error("未找到对应的库存操作");

  for (const shelve of input.shelves) {
    const goods = await findGoods(server, routeContext, input, shelve.binNum);

    if (goods) {
      for (const good of goods) {
        validateGoodForOutTransfer(server, inventory, good);

        await createGoodTransfer(server, routeContext, input.operationId, good);

        await handleGood(server, routeContext, good.id, good.location?.id);
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
      { operator: "eq", field: "lot_num", value: input.lotNum },
      { operator: "eq", field: "bin_num", value: binNum },
    ],
    properties: ["id", "material", "unit", "location", "quantity", "lotNum", "binNum", "validityDate", "lot", "state"],
  });
}

function validateGoodForOutTransfer(server: IRpdServer, inventory: MomInventoryOperation, good: MomGood) {
  if (inventory.operationType === "out" && good.quantity === 0) {
    throw new Error("物料数量为0，无法出库");
  }

  if (good.state != "normal") {
    throw new Error("物料已经操作，无法出库");
  }

  // if (inventory.businessType?.name === "领料出库") {
  //   if (good.validityDate && dayjs().isAfter(dayjs(good.validityDate))) {
  //     throw new Error(`托盘号：${good.binNum}，物料批次：${good.lotNum}，有效期：${good.validityDate}，已过期`);
  //   }
  //   if (!findInspectionSheet(server, good.lotNum, good.material?.id)) {
  //     throw new Error("未找到批次对应的检验单，请先进行检验");
  //   }
  // }
}

// async function findInspectionSheet(server: IRpdServer, lotNum?: string, materialId?: number) {
//   const inspectionSheetManager = server.getEntityManager("mom_inspection_sheet");
//   return await inspectionSheetManager.findEntity({
//     filters: [
//       {operator: "eq", field: "lot_num", value: lotNum},
//       {operator: "eq", field: "material_id", value: materialId},
//     ],
//   });
// }

async function createGoodTransfer(server: IRpdServer, routeContext: RouteContext, operationId: number, good: MomGood) {
  const goodTransferManager = server.getEntityManager<MomGoodTransfer>("mom_good_transfer");

  let savedGoodTransfer = {
    operation: { id: operationId },
    material: { id: good.material?.id },
    lotNum: good.lotNum,
    binNum: good.binNum,
    good: { id: good.id },
    quantity: good.quantity,
    unit: { id: good.unit?.id },
    from: { id: good.location?.id },
    transferTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    orderNum: 1,
  } as SaveMomGoodTransferInput;

  if (good.lot) {
    savedGoodTransfer = {
      ...savedGoodTransfer,
      lot: { id: good.lot.id },
    };
  }

  await goodTransferManager.createEntity({
    routeContext,
    entity: savedGoodTransfer,
  });
}

async function handleGood(server: IRpdServer, routeContext: RouteContext, goodId: number, locationId: number | undefined) {
  // 处理货品状态和位置信息

  if (!locationId) return;

  const good = await server.getEntityManager<MomGood>("mom_good").findById({ routeContext, id: goodId });

  if (good) {
    await server.getEntityManager<MomGood>("mom_good").updateEntityById({
      routeContext,
      id: goodId,
      entityToSave: {
        state: "transferred",
      } as SaveMomGoodInput,
    });
  }

  const goodLocationManager = server.getEntityManager<MomGoodLocation>("mom_good_location");

  const goodLocation = await goodLocationManager.findEntity({
    routeContext,
    filters: [
      {
        operator: "and",
        filters: [
          { field: "good", operator: "exists", filters: [{ field: "id", operator: "eq", value: goodId }] },
          {
            field: "location",
            operator: "exists",
            filters: [{ field: "id", operator: "eq", value: locationId }],
          },
        ],
      },
    ],
    properties: ["id"],
  });

  if (goodLocation) {
    await goodLocationManager.updateEntityById({
      routeContext,
      id: goodLocation.id,
      entityToSave: {
        takeOutTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      } as SaveMomGoodLocationInput,
    });
  }
}
