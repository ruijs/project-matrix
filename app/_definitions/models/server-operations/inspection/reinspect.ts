import type { ActionHandlerContext, ServerOperation } from "@ruiapp/rapid-core";
import { MomInspectionSheet } from "~/_definitions/meta/entity-types";

export type ReInspectInput = {
  inspectionSheetId: number;
};

// 重新检验
export default {
  code: "inspection/reinspect",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: ReInspectInput = ctx.input;

    await server.queryDatabaseObject(
      "delete from mom_inspection_measurements where sheet_id=$1",
      [input.inspectionSheetId],
      routeContext.getDbTransactionClient(),
    );
    await server.queryDatabaseObject(
      "delete from mom_inspection_sheet_samples where sheet_id=$1",
      [input.inspectionSheetId],
      routeContext.getDbTransactionClient(),
    );

    const inspectionSheetManager = server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet");
    await inspectionSheetManager.updateEntityById({
      routeContext,
      id: input.inspectionSheetId,
      entityToSave: {
        state: "pending",
        approvalState: "approving",
        treatment: undefined,
      } satisfies Partial<MomInspectionSheet>,
    });

    ctx.output = {};
  },
} satisfies ServerOperation;
