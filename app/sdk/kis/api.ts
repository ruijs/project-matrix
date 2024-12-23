import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import {v4 as uuidv4} from 'uuid';
import {machineIdSync} from 'node-machine-id';

interface KingdeeSDKConfig {
  baseURL: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  sessionId: string;
  authData: string;
  refreshAuthDataToken: string;
  accessTokenExpireIn: number;
  sessionIdExpireIn: number;
  refreshAuthDataTokenExpireIn: number;
  gatewayRouterAddr: string;
}

class KingdeeSDK {
  private axiosInstance: AxiosInstance;
  public authData: string = ''; // Placeholder for Kis-AuthData
  public gatewayRouterAddr: string = ''; // Placeholder for X-Gw-Router-Addr
  public machineId: string;
  public sessionId: string = ''; // Placeholder for sessionId
  public accessToken: string = ''; // Placeholder for accessToken
  public refreshAuthDataToken: string = ''; // Placeholder for refreshAuthDataToken
  public refreshAuthDataTokenExpireIn: number = 0; // Placeholder for auth data token expiration
  public accessTokenExpireIn: number = 0; // Placeholder for access token expiration
  public sessionIdExpireIn: number = 0; // Placeholder for session ID expiration

  public clientId: string;
  public clientSecret: string;

  constructor(config: KingdeeSDKConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });


    this.machineId = machineIdSync();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.accessToken = config.accessToken;
    this.sessionId = config.sessionId;
    this.authData = config.authData;
    this.refreshAuthDataToken = config.refreshAuthDataToken;
    this.accessTokenExpireIn = config.accessTokenExpireIn;
    this.sessionIdExpireIn = config.sessionIdExpireIn;
    this.refreshAuthDataTokenExpireIn = config.refreshAuthDataTokenExpireIn;
    this.gatewayRouterAddr = config.gatewayRouterAddr;

  }

  private async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      await this.ensureTokensAreValid();
      return await this.axiosInstance.request<T>(config);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data);
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }

  public async ensureTokensAreValid(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    if (now >= this.accessTokenExpireIn - 600) {
      await this.refreshAccessToken();
    }
    if (now >= this.refreshAuthDataTokenExpireIn - 600) {
      await this.refreshAuthData();
      await this.refreshAccessToken();
    }
    if (now >= this.sessionIdExpireIn - 600) {
      await this.refreshAuthData();
      await this.refreshAccessToken();
    }
  }

  public async getAccessToken(code :string): Promise<void> {
    const config: AxiosRequestConfig = {
      url: `/koas/oauth2/access_token`,
      method: 'POST',
      headers: {
        'Kis-State': this.machineId,
        'Kis-Timestamp': `${ Math.floor(Date.now() / 1000) }`,
        'Kis-Traceid': uuidv4(),
        'Kis-Ver': '1.0',
      },
      data: {
        code: code,
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const data = response.data.data;

    this.accessToken = data.access_token;
    this.accessTokenExpireIn = data.access_token_expire_in;
    this.sessionId = data.session_id;
    this.sessionIdExpireIn = data.session_id_expire_in;
  }

  public async getAuthData(): Promise<void> {
    const config: AxiosRequestConfig = {
      url: `/koas/user/get_service_gateway`,
      method: 'POST',
      headers: {
        'Kis-State': this.machineId,
        'Kis-Timestamp': `${ Math.floor(Date.now() / 1000) }`,
        'Kis-Traceid': uuidv4(),
        'Kis-Ver': '1.0',
      },
      data: {
        session_id: this.sessionId,
        pid: "1702618180f5eadcf3ca2ba2528cfac9",
        acctnumber: "UE124385172023121514032077S",
        icrmid: "2c9223b083cc0f130183e4c32be01544"
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const data = response.data.data;

    this.authData = data.auth_data;
    this.gatewayRouterAddr = data.gw_router_addr;
    this.refreshAuthDataToken = data.extend_data.refresh_auth_data_token;
    this.refreshAuthDataTokenExpireIn = data.extend_data.refresh_auth_data_token_expire_in;
  }

  public async refreshAccessToken(): Promise<void> {
    const config: AxiosRequestConfig = {
      url: `/koas/user/refresh_login_access_token?access_token=${ this.accessToken }`,
      method: 'POST',
      headers: {
        'Kis-State': this.machineId,
        'Kis-Timestamp': `${ Math.floor(Date.now() / 1000) }`,
        'Kis-Traceid': uuidv4(),
        'Kis-Ver': '1.0',
      },
      data: {
        session_id: this.sessionId,
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const data = response.data.data;

    this.accessToken = data.access_token;
    this.accessTokenExpireIn = data.access_token_expire_in;
    this.sessionId = data.session_id;
    this.sessionIdExpireIn = data.session_id_expire_in;
  }

  public async refreshAuthData(): Promise<void> {
    const config: AxiosRequestConfig = {
      url: `/koas/user/refresh_auth_data?client_id=${ this.clientId }&client_secret=${ this.clientSecret }`,
      method: 'POST',
      headers: {
        'Kis-State': this.machineId,
        'Kis-Timestamp': `${ Math.floor(Date.now() / 1000) }`,
        'Kis-Traceid': uuidv4(),
        'Kis-Ver': '1.0',
      },
      data: {
        refresh_auth_data_token: this.refreshAuthDataToken,
        access_token: this.accessToken,
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const data = response.data.data;

    this.accessToken = data.access_token;
    this.authData = data.auth_data;
    this.gatewayRouterAddr = data.gw_router_addr;
    this.refreshAuthDataToken = data.extend_data.refresh_auth_data_token;
    this.refreshAuthDataTokenExpireIn = data.extend_data.refresh_auth_data_token_expire_in;

  }

  public async PostResourceRequest(resourceUrl: string, payload: object, debug: boolean = false): Promise<AxiosResponse<any>> {
    const config: AxiosRequestConfig = {
      url: `${ resourceUrl }?access_token=${ this.accessToken }`,
      method: 'POST',
      headers: {
        'Kis-Authdata': this.authData,
        'Kis-State': this.machineId, // Use unique machine ID
        'Kis-Timestamp': `${ Math.floor(Date.now() / 1000) }`, // Current timestamp
        'Kis-Traceid': uuidv4(), // Unique trace ID
        'Kis-Ver': '1.0',
        'X-Gw-Router-Addr': this.gatewayRouterAddr,
      },
      data: payload,
    };
    if (debug) {
      // 打印请求和响应日志
      this.axiosInstance.interceptors.request.use(request => {
        console.log('Starting Request', JSON.stringify(request, null, 2))
        return request
      })

      this.axiosInstance.interceptors.response.use(response => {
        console.log('Response:', JSON.stringify(response.data, null, 2))
        return response
      })
    }
    return this.request<any>(config);
  }
}

export default KingdeeSDK;
