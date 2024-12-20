import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import type { MomGoodTransfer } from "~/_definitions/meta/entity-types";

export type CreateGoodTransferInput = {
  ids: number[];
};

// PDA入库操作接口
export default {
  code: "deleteGoodInTransfers",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext } = ctx;
    const input: CreateGoodTransferInput = ctx.input;

    await deleteGoodInTransfers(server, routerContext, input);

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;

async function deleteGoodInTransfers(server: IRpdServer, routeContext: RouteContext, input: CreateGoodTransferInput) {
  for (const goodId of input.ids) {
    await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").deleteById({
      routeContext,
      id: goodId,
    });
  }
}
