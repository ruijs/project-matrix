import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';

interface IotSDKConfig {
  baseURL: string;
}


class IotDBSDK {
  private axiosInstance: AxiosInstance;

  constructor(config: IotSDKConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('root:tj7uObnMyixd8XKG'),
      },
    });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
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

  public async PutResourceRequest(resourceUrl: string, payload: object, debug: boolean = false): Promise<AxiosResponse<any>> {
    const config: AxiosRequestConfig = {
      url: `${ resourceUrl }`,
      method: 'PUT',
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

  public async PostResourceRequest(resourceUrl: string, payload: object, debug: boolean = false): Promise<AxiosResponse<any>> {
    const config: AxiosRequestConfig = {
      url: `${ resourceUrl }`,
      method: 'POST',
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

  public async GetResourceRequest(resourceUrl: string, payload: object, debug: boolean = false): Promise<AxiosResponse<any>> {
    const config: AxiosRequestConfig = {
      url: `${ resourceUrl }`,
      method: 'GET',
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

export default IotDBSDK;
