import type { ActionHandlerContext, CronJobConfiguration, IRpdServer } from "@ruiapp/rapid-core";
import KingdeeSDK from "~/sdk/kis/api";
import { SaveKisConfigInput } from "~/_definitions/meta/entity-types";
import EventLogService from "rapid-plugins/eventLog/services/EventLogService";
import { getBooleanEnvValue } from "~/utils/env-utils";
import { pick } from "lodash";

// 每隔60分钟尝试刷新一次accessToken
const refreshIntervalMinutes = 60;

export default {
  code: "kisRefreshAccessTokenJob",

  disabled: getBooleanEnvValue("KIS_REFRESH_ACCESS_TOKEN_JOB_DISABLED"),

  cronTime: `* * */1 * * *`,

  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    await refreshKisTokens(ctx, server);
  },
} satisfies CronJobConfiguration;

// handle kis config
async function refreshKisTokens(ctx: ActionHandlerContext, server: IRpdServer) {
  const { routerContext: routeContext, logger } = ctx;
  const kisConfigManager = server.getEntityManager("kis_config");

  let kis: KingdeeSDK | undefined;

  try {
    const ksc = await kisConfigManager.findEntity({ routeContext });
    if (!ksc) {
      throw new Error(`未找到KIS配置信息。`);
    }

    kis = new KingdeeSDK(logger, {
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

    const expiresInSeconds = refreshIntervalMinutes * 1.5 * 60;
    await kis.refreshAccessTokenIfNecessary(expiresInSeconds);

    // update kis config
    await kisConfigManager.updateEntityById({
      routeContext,
      id: ksc.id,
      entityToSave: {
        access_token: kis.accessToken,
        access_token_expire_in: kis.accessTokenExpireIn,
        session_id: kis.sessionId,
        session_id_expire_in: kis.sessionIdExpireIn,
      } as SaveKisConfigInput,
    });
  } catch (error: any) {
    server.getLogger().error("刷新KIS access token失败。", { error });
    server.getService<EventLogService>("eventLogService").createLog({
      sourceType: "app",
      eventTypeCode: "kis.refreshAccessToken",
      level: "error",
      message: `刷新KIS access token失败。`,
      details: (error as Error).stack,
      data: kis && pick(kis, ["accessToken", "accessTokenExpireIn", "sessionId", "sessionIdExpireIn"]),
    });
  }
}
