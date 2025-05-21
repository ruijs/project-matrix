import type { ActionHandlerContext, ServerOperation } from "@ruiapp/rapid-core";
import type { MomInventoryApplication, MomInventoryOperation } from "~/_definitions/meta/entity-types";
import { sendInventoryOperationSheetToErp } from "~/services/InventoryOperationService";

export type SendOperationSheetToErpInput = {
  applicationId: number;
};

// 标识卡拆分操作接口
export default {
  code: "inventory/sendOperationSheetToErp",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: SendOperationSheetToErpInput = ctx.input;

    const inventoryApplicationManager = server.getEntityManager<MomInventoryApplication>("mom_inventory_application");
    const inventoryApplication = await inventoryApplicationManager.findById({
      routeContext,
      id: input.applicationId,
    });
    if (!inventoryApplication) {
      throw new Error("库存业务申请单不存在。");
    }

    const inventoryOperationManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");
    const inventoryOperations = await inventoryOperationManager.findEntities({
      routeContext,
      filters: [
        {
          operator: "eq",
          field: "application_id",
          value: input.applicationId,
        },
      ],
    });

    if (!inventoryOperations.length) {
      throw new Error("库存操作单不存在。");
    }
    if (inventoryOperations.length > 2) {
      throw new Error("存在多个库存操作单，请联系系统管理员进行处理。");
    }

    await sendInventoryOperationSheetToErp(server, routeContext, inventoryOperations[0]);

    ctx.output = {};
  },
} satisfies ServerOperation;
