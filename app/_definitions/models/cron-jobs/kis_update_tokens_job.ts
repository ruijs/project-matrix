import type { ActionHandlerContext, CronJobConfiguration, IRpdServer } from "@ruiapp/rapid-core";
import KingdeeSDK from "~/sdk/kis/api";
import { SaveKisConfigInput } from "~/_definitions/meta/entity-types";
import EventLogService from "rapid-plugins/eventLog/services/EventLogService";

// 每隔10分钟刷新一次token
const refreshIntervalMinutes = 10;

export default {
  code: "kis-update-tokens-job",

  cronTime: `*/${refreshIntervalMinutes} * * * *`,

  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    await refreshKisTokens(ctx, server);
  },
} satisfies CronJobConfiguration;

// handle kis config
async function refreshKisTokens(ctx: ActionHandlerContext, server: IRpdServer) {
  const { routerContext: routeContext, logger } = ctx;
  const kisConfigManager = server.getEntityManager("kis_config");

  const ksc = await kisConfigManager.findEntity({ routeContext });

  const kis = new KingdeeSDK(logger, {
    baseURL: ksc.api_endpoint,
    clientId: ksc.client_id,
    clientSecret: ksc.client_secret,
    accessToken: ksc.access_token,
    accessTokenExpireIn: ksc.access_token_expire_in,
    sessionId: ksc.session_id,
    sessionSecret: ksc.session_secret,
    sessionIdExpireIn: ksc.session_id_expire_in,
    authData: ksc.auth_data,
    refreshAuthDataToken: ksc.refresh_auth_data_token,
    refreshAuthDataTokenExpireIn: ksc.refresh_auth_data_token_expire_in,
    gatewayRouterAddr: ksc.gateway_router_addr,
  });

  try {
    const expiresInSeconds = refreshIntervalMinutes * 1.5 * 60;
    await kis.refreshTokensIfNecessary(expiresInSeconds);

    // update kis config
    await kisConfigManager.updateEntityById({
      routeContext,
      id: ksc.id,
      entityToSave: {
        access_token: kis.accessToken,
        access_token_expire_in: kis.accessTokenExpireIn,
        auth_data: kis.authData,
        refresh_auth_data_token: kis.refreshAuthDataToken,
        refresh_auth_data_token_expire_in: kis.refreshAuthDataTokenExpireIn,
        session_id: kis.sessionId,
        session_id_expire_in: kis.sessionIdExpireIn,
        gateway_router_addr: kis.gatewayRouterAddr,
      } as SaveKisConfigInput,
    });
  } catch (error: any) {
    server.getLogger().error("刷新KIS token失败。", { error });
    server.getService<EventLogService>("eventLogService").createLog({
      sourceType: "app",
      eventTypeCode: "kis.refreshToken",
      level: "error",
      message: `刷新KIS token失败。`,
      details: (error as Error).stack,
      data: {
        accessToken: kis.accessToken,
        accessTokenExpireIn: kis.accessTokenExpireIn,
        authData: kis.authData,
        refreshAuthDataToken: kis.refreshAuthDataToken,
        refreshAuthDataTokenExpireIn: kis.refreshAuthDataTokenExpireIn,
        sessionId: kis.sessionId,
        sessionIdExpireIn: kis.sessionIdExpireIn,
        gatewayRouterAddr: kis.gatewayRouterAddr,
      },
    });
  }
}
