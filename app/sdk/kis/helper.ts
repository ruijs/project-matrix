import { IRpdServer, Logger, RouteContext } from "@ruiapp/rapid-core";
import KingdeeSDK from "~/sdk/kis/api";
import { KisConfig } from "~/_definitions/meta/entity-types";

class KisHelper {
  private server: IRpdServer;

  constructor(server: IRpdServer) {
    this.server = server;
  }

  public async NewAPIClient(logger: Logger) {
    const kisConfigManager = this.server.getEntityManager<KisConfig>("kis_config");
    const routeContext = new RouteContext(this.server);
    const ksc = await kisConfigManager.findEntity({ routeContext });

    if (!ksc) {
      throw new Error("Kis config not found");
    }

    return new KingdeeSDK(logger, {
      baseURL: ksc?.api_endpoint || "",
      clientId: ksc?.client_id || "",
      clientSecret: ksc?.client_secret || "",
      accessToken: ksc?.access_token || "",
      accessTokenExpireIn: ksc.access_token_expire_in,
      sessionId: ksc.session_id,
      sessionSecret: ksc.session_secret || "",
      sessionIdExpireIn: ksc.session_id_expire_in,
      authData: ksc.auth_data,
      refreshAuthDataToken: ksc.refresh_auth_data_token,
      refreshAuthDataTokenExpireIn: ksc.refresh_auth_data_token_expire_in,
      gatewayRouterAddr: ksc.gateway_router_addr,
    });
  }
}

export default KisHelper;
