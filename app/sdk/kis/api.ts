import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { v4 as uuidv4 } from "uuid";
import { machineIdSync } from "node-machine-id";
import { createHash } from "crypto";
import { Logger } from "@ruiapp/rapid-core";

interface KingdeeSDKConfig {
  baseURL: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  sessionId: string;
  sessionSecret: string;
  authData: string;
  refreshAuthDataToken: string;
  accessTokenExpireIn: number;
  sessionIdExpireIn: number;
  refreshAuthDataTokenExpireIn: number;
  gatewayRouterAddr: string;
}

export type GetAccountAppListOptions = {
  acctnumber: string;
  pid: string;
};

export type GetServiceGatewayOptions = {
  acctnumber: string;
  pid: string;
  icrmid: string;
};

class KingdeeSDK {
  #logger: Logger;
  private axiosInstance: AxiosInstance;
  public authData: string = ""; // Placeholder for Kis-AuthData
  public gatewayRouterAddr: string = ""; // Placeholder for X-Gw-Router-Addr
  public machineId: string;
  public sessionId: string = ""; // Placeholder for sessionId
  public sessionSecret: string = ""; // Placeholder for sessionSecret
  public accessToken: string = ""; // Placeholder for accessToken
  public refreshAuthDataToken: string = ""; // Placeholder for refreshAuthDataToken
  public refreshAuthDataTokenExpireIn: number = 0; // Placeholder for auth data token expiration
  public accessTokenExpireIn: number = 0; // Placeholder for access token expiration
  public sessionIdExpireIn: number = 0; // Placeholder for session ID expiration

  public clientId: string;
  public clientSecret: string;

  constructor(logger: Logger, config: KingdeeSDKConfig) {
    this.#logger = logger;
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: null,
    });

    this.machineId = machineIdSync();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.accessToken = config.accessToken;
    this.sessionId = config.sessionId;
    this.sessionSecret = config.sessionSecret;
    this.authData = config.authData;
    this.refreshAuthDataToken = config.refreshAuthDataToken;
    this.accessTokenExpireIn = config.accessTokenExpireIn;
    this.sessionIdExpireIn = config.sessionIdExpireIn;
    this.refreshAuthDataTokenExpireIn = config.refreshAuthDataTokenExpireIn;
    this.gatewayRouterAddr = config.gatewayRouterAddr;
  }

  private async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.request<T>(config);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  }

  /**
   * 当accessToken或者authData即将过期时刷新
   * @param expiresInSeconds 刷新提前时间，即：在多少秒内过期则刷新。默认为600秒。
   */
  public async refreshTokensIfNecessary(expiresInSeconds: number = 600): Promise<void> {
    const now = Math.floor(Date.now() / 1000);

    if (now >= this.accessTokenExpireIn - expiresInSeconds || now >= this.sessionIdExpireIn - expiresInSeconds) {
      await this.refreshAccessToken();
    }

    if (now >= this.refreshAuthDataTokenExpireIn - expiresInSeconds) {
      await this.refreshAuthData();
    }
  }

  public async getAccessToken(code: string): Promise<void> {
    const config: AxiosRequestConfig = {
      url: `/koas/oauth2/access_token?client_id=${this.clientId}&client_secret=${this.clientSecret}`,
      method: "POST",
      headers: {
        "Kis-State": this.machineId,
        "Kis-Timestamp": `${Math.floor(Date.now() / 1000)}`,
        "Kis-Traceid": uuidv4(),
        "Kis-Ver": "1.0",
      },
      data: {
        code: code,
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const result = response.data;
    if (result.errcode) {
      throw newKisApiError("获取AccessToken失败。", result);
    }
    const data = result.data;

    this.accessToken = data.access_token;
    this.accessTokenExpireIn = data.access_token_expire_in;
    this.sessionId = data.session_id;
    this.sessionIdExpireIn = data.session_id_expire_in;
    this.sessionSecret = data.session_secret;
  }

  public async getAuthData(): Promise<void> {
    const timestamp = `${Math.floor(Date.now() / 1000)}`;
    const traceID = uuidv4();

    const config: AxiosRequestConfig = {
      url: `/koas/user/get_service_gateway?access_token=${this.accessToken}`,
      method: "POST",
      headers: {
        "Kis-State": this.machineId,
        "Kis-Timestamp": timestamp,
        "Kis-Traceid": traceID,
        "Kis-Ver": "1.0",
        "KIS-Signature": getKisSignature({
          state: this.machineId,
          sessionId: this.sessionId,
          traceID,
          sessionSecret: this.sessionSecret,
          timestamp,
        }),
      },
      data: {
        session_id: this.sessionId,
        pid: "1702618180f5eadcf3ca2ba2528cfac9",
        acctnumber: "UE124385172023121513521899S",
        icrmid: "2c9223b083cc0f130183e4c32be01544",
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const result = response.data;
    if (result.errcode) {
      throw newKisApiError("获取业务接口网关和auth_data失败。", result);
    }
    const data = result.data;

    this.authData = data.auth_data;
    this.gatewayRouterAddr = data.gw_router_addr;
    this.refreshAuthDataToken = data.extend_data.refresh_auth_data_token;
    this.refreshAuthDataTokenExpireIn = data.extend_data.refresh_auth_data_token_expire_in;
  }

  public async refreshAccessToken(): Promise<void> {
    const config: AxiosRequestConfig = {
      url: `/koas/user/refresh_login_access_token?access_token=${this.accessToken}`,
      method: "POST",
      headers: {
        "Kis-State": this.machineId,
        "Kis-Timestamp": `${Math.floor(Date.now() / 1000)}`,
        "Kis-Traceid": uuidv4(),
        "Kis-Ver": "1.0",
      },
      data: {
        session_id: this.sessionId,
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const result = response.data;
    if (result.errcode) {
      throw newKisApiError("刷新AccessToken失败。", result);
    }
    const data = result.data;

    this.accessToken = data.access_token;
    this.accessTokenExpireIn = data.access_token_expire_in;
    this.sessionId = data.session_id;
    this.sessionIdExpireIn = data.session_id_expire_in;
  }

  public async refreshAuthData(): Promise<void> {
    const config: AxiosRequestConfig = {
      url: `/koas/user/refresh_auth_data?client_id=${this.clientId}&client_secret=${this.clientSecret}`,
      method: "POST",
      headers: {
        "Kis-State": this.machineId,
        "Kis-Timestamp": `${Math.floor(Date.now() / 1000)}`,
        "Kis-Traceid": uuidv4(),
        "Kis-Ver": "1.0",
      },
      data: {
        refresh_auth_data_token: this.refreshAuthDataToken,
        access_token: this.accessToken,
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const result = response.data;
    if (result.errcode) {
      throw newKisApiError("刷新AuthData失败。", result);
    }
    const data = result.data;

    this.accessToken = data.access_token;
    this.authData = data.auth_data;
    this.gatewayRouterAddr = data.gw_router_addr;
    this.refreshAuthDataToken = data.extend_data.refresh_auth_data_token;
    this.refreshAuthDataTokenExpireIn = data.extend_data.refresh_auth_data_token_expire_in;
  }

  public async getUserLoginStatus(): Promise<any> {
    const timestamp = `${Math.floor(Date.now() / 1000)}`;
    const traceID = uuidv4();

    const config: AxiosRequestConfig = {
      url: `/koas/user/login_status?access_token=${this.accessToken}`,
      method: "POST",
      headers: {
        "Kis-State": this.machineId,
        "Kis-Timestamp": timestamp,
        "Kis-Traceid": traceID,
        "Kis-Ver": "1.0",
      },
      data: {
        session_id: this.sessionId,
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const result = response.data;
    if (result.errcode) {
      throw newKisApiError("获取KIS云用户登录态失败。", result);
    }
    const data = result.data;
    return data;
  }

  public async listAccounts(): Promise<any> {
    const timestamp = `${Math.floor(Date.now() / 1000)}`;
    const traceID = uuidv4();

    const config: AxiosRequestConfig = {
      url: `/koas/user/account?access_token=${this.accessToken}`,
      method: "POST",
      headers: {
        "Kis-State": this.machineId,
        "Kis-Timestamp": timestamp,
        "Kis-Traceid": traceID,
        "Kis-Ver": "1.0",
        "KIS-Signature": getKisSignature({
          state: this.machineId,
          sessionId: this.sessionId,
          traceID,
          sessionSecret: this.sessionSecret,
          timestamp,
        }),
      },
      data: {
        session_id: this.sessionId,
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const result = response.data;
    if (result.errcode) {
      throw newKisApiError("获取账套信息失败。", result);
    }
    const data = result.data;
    return data;
  }

  public async getAccountAppList(options: GetAccountAppListOptions): Promise<any> {
    const timestamp = `${Math.floor(Date.now() / 1000)}`;
    const traceID = uuidv4();

    const config: AxiosRequestConfig = {
      url: `/koas/user/account_applist?access_token=${this.accessToken}`,
      method: "POST",
      headers: {
        "Kis-State": this.machineId,
        "Kis-Timestamp": timestamp,
        "Kis-Traceid": traceID,
        "Kis-Ver": "1.0",
        "KIS-Signature": getKisSignature({
          state: this.machineId,
          sessionId: this.sessionId,
          traceID,
          sessionSecret: this.sessionSecret,
          timestamp,
        }),
      },
      data: {
        session_id: this.sessionId,
        client_id: this.clientId,
        acctnumber: options.acctnumber,
        pid: options.pid,
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const result = response.data;
    if (result.errcode) {
      throw newKisApiError("获取生态应用列表失败。", result);
    }
    const data = result.data;
    return data;
  }

  public async getServiceGateway(options: GetServiceGatewayOptions): Promise<any> {
    const timestamp = `${Math.floor(Date.now() / 1000)}`;
    const traceID = uuidv4();

    const config: AxiosRequestConfig = {
      url: `/koas/user/get_service_gateway?access_token=${this.accessToken}`,
      method: "POST",
      headers: {
        "Kis-State": this.machineId,
        "Kis-Timestamp": timestamp,
        "Kis-Traceid": traceID,
        "Kis-Ver": "1.0",
        "KIS-Signature": getKisSignature({
          state: this.machineId,
          sessionId: this.sessionId,
          traceID,
          sessionSecret: this.sessionSecret,
          timestamp,
        }),
      },
      data: {
        session_id: this.sessionId,
        acctnumber: options.acctnumber,
        pid: options.pid,
        icrmid: options.icrmid,
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const result = response.data;
    if (result.errcode) {
      throw newKisApiError("获取业务接口网关和auth_data失败。", result);
    }
    const data = result.data;
    return data;
  }

  public async PostResourceRequest(resourceUrl: string, payload: object, debug: boolean = false): Promise<AxiosResponse<any>> {
    const config: AxiosRequestConfig = {
      url: `${resourceUrl}?access_token=${this.accessToken}`,
      method: "POST",
      headers: {
        "Kis-Authdata": this.authData,
        "Kis-State": this.machineId, // Use unique machine ID
        "Kis-Timestamp": `${Math.floor(Date.now() / 1000)}`, // Current timestamp
        "Kis-Traceid": uuidv4(), // Unique trace ID
        "Kis-Ver": "1.0",
        "X-Gw-Router-Addr": this.gatewayRouterAddr,
      },
      data: payload,
    };
    if (debug) {
      // 打印请求和响应日志
      this.axiosInstance.interceptors.request.use((request) => {
        console.log("Starting Request", JSON.stringify(request, null, 2));
        return request;
      });

      this.axiosInstance.interceptors.response.use((response) => {
        console.log("Response:", JSON.stringify(response.data, null, 2));
        return response;
      });
    }
    return this.request<any>(config);
  }
}

export default KingdeeSDK;

export type GetKisSignatureOptions = {
  state: string;
  sessionId: string;
  traceID: string;
  sessionSecret: string;
  timestamp: string;
};

export function getKisSignature(options: GetKisSignatureOptions) {
  const { state, sessionId, traceID, sessionSecret, timestamp } = options;
  const contentToSign = `${state}${sessionId}${traceID}${sessionSecret}${timestamp}`;
  const sha256 = createHash("sha256");
  sha256.update(contentToSign);
  return sha256.digest("hex");
}

export type KisApiResultBase = {
  errcode: number;
  description: string;
};

export function newKisApiError(message: string, apiResult: KisApiResultBase) {
  const error = new Error(`${message} KIS接口错误: ${apiResult.errcode}, ${apiResult.description}`);
  error.name = "KisApiError";
  return error;
}
