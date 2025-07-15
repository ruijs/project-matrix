import { IRpdServer } from "@ruiapp/rapid-core";
import { YidaConfig } from "~/_definitions/meta/entity-types";
import YidaSDK from "~/sdk/yida/sdk";

class YidaHelper {
  private server: IRpdServer;

  constructor(server: IRpdServer) {
    this.server = server;
  }

  public async NewAPIClient() {
    const yidaConfigManager = this.server.getEntityManager<YidaConfig>("yida_config");
    const yc = await yidaConfigManager.findEntity({});

    if (!yc) {
      throw new Error("Yida config not found");
    }

    return new YidaSDK({
      baseURL: yc?.yida_api_endpoint || "",
      clientId: yc?.client_id || "",
      clientSecret: yc?.client_secret || "",
      accessToken: yc?.access_token || "",
      accessTokenExpireIn: yc.access_token_expire_in,
    });
  }
}

export default YidaHelper;
