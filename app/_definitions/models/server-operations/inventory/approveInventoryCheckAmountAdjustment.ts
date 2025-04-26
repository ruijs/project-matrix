import type { ActionHandlerContext, ServerOperation } from "@ruiapp/rapid-core";
import { MomGoodTransfer, MomInventoryApplication, MomInventoryOperation } from "~/_definitions/meta/entity-types";
import { submitGoodOutTransfers } from "../mom/submitGoodOutTransfers";

type ApproveInventoryCheckAmountAdjustmentInput = {
  applicationId: number;
};

export default {
  code: "inventory/approveInventoryCheckAmountAdjustment",

  method: "POST",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext, input } = ctx;
    const currentUserId = ctx.routerContext.state.userId;

    if (!currentUserId) {
      throw new Error("您的登录已失效。");
    }

    const { applicationId } = input as ApproveInventoryCheckAmountAdjustmentInput;
    if (!applicationId) {
      throw new Error("参数 applicationId 不能为空");
    }

    const inventoryApplicationManager = server.getEntityManager<MomInventoryApplication>("mom_inventory_application");
    const inventoryApplication = await inventoryApplicationManager.findById({
      routeContext,
      id: applicationId,
      relations: {
        items: true,
      },
      keepNonPropertyFields: true,
    });

    if (!inventoryApplication) {
      throw new Error("申请单不存在。");
    }

    if (inventoryApplication.state !== "approving") {
      throw new Error("审批失败，申请单不在待审批状态。");
    }

    const inventoryOperationManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");
    let inventoryOperation = await inventoryOperationManager.findEntity({
      routeContext,
      filters: [
        {
          operator: "eq",
          field: "application",
          value: applicationId,
        },
      ],
    });

    if (!inventoryOperation) {
      const inventoryOperationToSave: Partial<MomInventoryOperation> = {
        application: { id: applicationId },
        state: "pending",
        approvalState: "approved",
        operationType: inventoryApplication.operationType,
        businessType: (inventoryApplication as any).business_id,
        warehouse: (inventoryApplication as any).from_warehouse_id || (inventoryApplication as any).to_warehouse_id,
      };

      inventoryOperation = await inventoryOperationManager.createEntity({
        routeContext,
        entity: inventoryOperationToSave,
      });
    }

    for (const applicationItem of inventoryApplication.items || []) {
      await submitGoodOutTransfers(server, routeContext, {
        operationId: inventoryOperation.id,
        materialId: (applicationItem as any).material_id,
        lotNum: applicationItem.lotNum!,
        shelves: [{ binNum: applicationItem.binNum! }],
      });
    }

    await inventoryOperationManager.updateEntityById({
      routeContext,
      id: inventoryOperation.id,
      entityToSave: {
        state: "done",
      } satisfies Partial<MomInventoryOperation>,
    });

    await inventoryApplicationManager.updateEntityById({
      routeContext,
      id: applicationId,
      entityToSave: {
        state: "approved",
        operationState: "done",
      } satisfies Partial<MomInventoryApplication>,
    });

    ctx.output = {};
  },
} satisfies ServerOperation;
