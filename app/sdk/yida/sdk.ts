import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

interface YidaSDKConfig {
  baseURL: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  accessTokenExpireIn: number;
}

class YidaSDK {
  private axiosInstance: AxiosInstance;
  public accessToken: string = ""; // Placeholder for accessToken
  public accessTokenExpireIn: number = 0; // Placeholder for access token expiration
  public clientId: string;
  public clientSecret: string;

  constructor(config: YidaSDKConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.accessToken = config.accessToken;
    this.accessTokenExpireIn = config.accessTokenExpireIn;
  }

  private async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      await this.ensureTokensAreValid();
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

  public async ensureTokensAreValid(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    if (now >= this.accessTokenExpireIn - 600) {
      await this.refreshAccessToken();
    }

    // await this.refreshAccessToken();
  }

  public async refreshAccessToken(): Promise<void> {
    const config: AxiosRequestConfig = {
      url: `https://api.dingtalk.com/v1.0/oauth2/accessToken`,
      method: "POST",
      data: {
        appKey: this.clientId,
        appSecret: this.clientSecret,
      },
    };

    const response = await this.axiosInstance.request<any>(config);
    const data = response.data;

    console.log("refreshAccessToken: " + JSON.stringify(data));

    this.accessToken = data.accessToken;
    this.accessTokenExpireIn = Date.now() / 1000 + data.expireIn;
  }

  public async PostDingtalkResourceRequest(resourceUrl: string, payload: object, debug: boolean = false): Promise<AxiosResponse<any>> {
    await this.ensureTokensAreValid();

    const config: AxiosRequestConfig = {
      baseURL: "https://oapi.dingtalk.com",
      url: `${resourceUrl}?access_token=${this.accessToken}`,
      method: "POST",
      headers: {
        "x-acs-dingtalk-access-token": this.accessToken,
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

  public async PostResourceRequest(resourceUrl: string, payload: object, debug: boolean = false): Promise<AxiosResponse<any>> {
    await this.ensureTokensAreValid();

    const config: AxiosRequestConfig = {
      url: `${resourceUrl}`,
      method: "POST",
      headers: {
        "x-acs-dingtalk-access-token": this.accessToken,
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

  public async GetResourceRequest(resourceUrl: string, payload: object, debug: boolean = false): Promise<AxiosResponse<any>> {
    await this.ensureTokensAreValid();

    const queryParams = new URLSearchParams(payload as any).toString();
    const separator = resourceUrl.includes("?") ? "&" : "?";

    const config: AxiosRequestConfig = {
      url: `${resourceUrl}${separator}${queryParams}`,
      method: "GET",
      headers: {
        "x-acs-dingtalk-access-token": this.accessToken,
      },
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

export default YidaSDK;
