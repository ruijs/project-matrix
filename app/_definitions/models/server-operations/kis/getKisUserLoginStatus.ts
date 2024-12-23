import { ActionHandlerContext, ServerOperation } from "@ruiapp/rapid-core";
import KisHelper from "~/sdk/kis/helper";

export default {
  code: "getKisUserLoginStatus",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;

    const kisApi = await new KisHelper(server).NewAPIClient(server.getLogger());

    const result = await kisApi.getUserLoginStatus();

    ctx.output = result || {};
  },
} satisfies ServerOperation;
