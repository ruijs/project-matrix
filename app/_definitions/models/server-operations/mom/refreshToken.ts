import { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import KisHelper from "~/sdk/kis/helper";
import { SaveKisConfigInput } from "~/_definitions/meta/entity-types";
import KingdeeSDK from "~/sdk/kis/api";

export type TokenInput = {
  code: string;
};

export default {
  code: "refreshToken",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: TokenInput = ctx.input;

    const result = await refreshToken(server, routeContext, input);

    ctx.output = result;
  },
} satisfies ServerOperation;

async function refreshToken(server: IRpdServer, routeContext: RouteContext, input: TokenInput) {
  const kisApi = await new KisHelper(server).NewAPIClient(server.getLogger());
  await kisApi.getAccessToken(input.code);
  await kisApi.getAuthData();
  await saveAuthInfoToDb(server, routeContext, kisApi);
}

async function saveAuthInfoToDb(server: IRpdServer, routeContext: RouteContext, kisApi: KingdeeSDK) {
  const kisConfigManager = server.getEntityManager("kis_config");
  const ksc = await kisConfigManager.findEntity({ routeContext });

  return await kisConfigManager.updateEntityById({
    routeContext,
    id: ksc.id,
    entityToSave: {
      access_token: kisApi.accessToken,
      access_token_expire_in: kisApi.accessTokenExpireIn,
      auth_data: kisApi.authData,
      refresh_auth_data_token: kisApi.refreshAuthDataToken,
      refresh_auth_data_token_expire_in: kisApi.refreshAuthDataTokenExpireIn,
      session_id: kisApi.sessionId,
      session_id_expire_in: kisApi.sessionIdExpireIn,
      session_secret: kisApi.sessionSecret,
      gateway_router_addr: kisApi.gatewayRouterAddr,
    } as SaveKisConfigInput,
  });
}
