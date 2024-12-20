import { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import type {
  BaseLocation,
  BaseMaterial,
  BaseUnit,
  MomGood,
  MomGoodTransfer,
  MomInventoryOperation,
  SaveMomGoodInput,
  SaveMomGoodTransferInput,
  SaveMomInventoryOperationInput,
} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";

export type CreateInventoryOperationInput = {
  operationType: MomInventoryOperation["operationType"];
  businessDetails: any;
  transfers: {
    /**
     * 转出位置
     */
    from?: Partial<BaseLocation>;
    /**
     * 转入位置
     */
    to?: Partial<BaseLocation>;
    /**
     * 物料
     */
    material?: Partial<BaseMaterial>;
    /**
     * 物料号
     */
    materialCode?: string;
    /**
     * 批号
     */
    lotNum?: string;
    /**
     * 箱号
     */
    binNum?: string;
    /**
     * 序列号
     */
    serialNum?: string;
    /**
     * 数量
     */
    quantity?: number;
    /**
     * 单位
     */
    unit?: Partial<BaseUnit>;
  }[];
};

export default {
  code: "createInventoryOperation",

  method: "POST",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext } = ctx;
    const input: CreateInventoryOperationInput = ctx.input;

    await createInventoryOperation(server, routerContext, input);

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;

export async function createInventoryOperation(server: IRpdServer, routeContext: RouteContext, input: CreateInventoryOperationInput) {
  const inventoryOperationManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");
  const goodManager = server.getEntityManager<MomGood>("mom_good");
  const goodTransferManager = server.getEntityManager<MomGoodTransfer>("mom_good_transfer");

  const inventoryOperation = await inventoryOperationManager.createEntity({
    routeContext,
    entity: {
      code: dayjs().format("YYYYMMDD-HHmmss"),
      operationType: input.operationType,
      businessDetails: input.businessDetails,
      state: "processing",
    } as SaveMomInventoryOperationInput,
  });

  for (const transfer of input.transfers) {
    let good = await goodManager.findEntity({
      routeContext,
      filters: [
        {
          operator: "eq",
          field: "material_id",
          value: transfer.material?.id,
        },
        {
          operator: "eq",
          field: "lot_num",
          value: transfer.lotNum,
        },
      ],
    });

    if (!good) {
      good = await goodManager.createEntity({
        routeContext,
        entity: {
          material: { id: transfer.material?.id },
          materialCode: transfer.material?.code,
          lotNum: transfer.lotNum,
          binNum: transfer.binNum,
          serialNum: transfer.serialNum,
          quantity: transfer.quantity,
          unit: { id: transfer.unit?.id },
          state: "normal",
        } as SaveMomGoodInput,
      });
    }

    await goodTransferManager.createEntity({
      routeContext,
      entity: {
        operation: { id: inventoryOperation.id },
        good: { id: good.id },
        material: { id: transfer.material?.id },
        lotNum: transfer.lotNum,
        binNum: transfer.binNum,
        serialNum: transfer.serialNum,
        quantity: transfer.quantity,
        unit: { id: transfer.unit?.id },
        to: { id: 1 },
        transferTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      } as SaveMomGoodTransferInput,
    });
  }

  inventoryOperationManager.updateEntityById({
    routeContext,
    id: inventoryOperation.id,
    entityToSave: {
      state: "done",
    } as SaveMomInventoryOperationInput,
  });
}
