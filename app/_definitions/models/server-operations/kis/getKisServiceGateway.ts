import { ActionHandlerContext, ServerOperation } from "@ruiapp/rapid-core";
import KisHelper from "~/sdk/kis/helper";

export default {
  code: "getKisServiceGateway",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;

    const kisApi = await new KisHelper(server).NewAPIClient(server.getLogger());

    const result = await kisApi.getServiceGateway(ctx.input);

    ctx.output = result || {};
  },
} satisfies ServerOperation;
