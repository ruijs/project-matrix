import {ActionHandlerContext, IRpdServer, ServerOperation} from "@ruiapp/rapid-core";
import KisHelper from "~/sdk/kis/helper";
import {SaveKisConfigInput} from "~/_definitions/meta/entity-types";

export type TokenInput = {
  code: string;
};

export default {
  code: "refreshToken",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    const input: TokenInput = ctx.input;

    const result =  await refreshToken(server, input);

    ctx.output = result;
  },
} satisfies ServerOperation;

async function refreshToken(server: IRpdServer, input: TokenInput) {
  const kisApi = await new KisHelper(server).NewAPIClient();
  await kisApi.getAccessToken(input.code)
  await kisApi.refreshAuthData()
  const kisConfigManager = server.getEntityManager("kis_config");

  const ksc = await kisConfigManager.findEntity({});

  return await kisConfigManager.updateEntityById({
    id: ksc.id,
    entityToSave: {
      access_token: kisApi.accessToken,
      access_token_expire_in: kisApi.accessTokenExpireIn,
      auth_data: kisApi.authData,
      refresh_auth_data_token: kisApi.refreshAuthDataToken,
      refresh_auth_data_token_expire_in: kisApi.refreshAuthDataTokenExpireIn,
      session_id: kisApi.sessionId,
      session_id_expire_in: kisApi.sessionIdExpireIn,
      gateway_router_addr: kisApi.gatewayRouterAddr,
    } as SaveKisConfigInput
  })
}
