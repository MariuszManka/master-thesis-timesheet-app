import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders, AxiosError } from "axios";

import { SessionStorage } from "./CookieStorage"
import { STORAGEKEYS } from 'environment/Keys'
import { IAccessTokenResponseModel } from 'models/HttpRequestModels'
import { Environment } from 'environment/AppSettings'



interface AdaptAxiosRequestConfig extends AxiosRequestConfig {
  headers: AxiosRequestHeaders
}

export class CustomAxiosErrorResponse {
  public readonly message: string
  public readonly statusCode: number
  public readonly statusText: string
  public readonly errorResponseData: AxiosError['response']

  public constructor(error: AxiosError) {
    //@ts-ignore
    this.message = error.response?.data?.detail ?? error.message ?? ""
    this.statusCode = error.status ?? 0
    this.statusText = error.response?.statusText ?? ""
    this.errorResponseData = error.response
  }
}


export class HttpClient {
  private readonly _instance: AxiosInstance;
  private readonly _storage: SessionStorage;
  private readonly _errorStatus = [400, 404, 500];
  private readonly _authErrors = [401, 403];


  public constructor() {
    this._instance = axios.create({ baseURL: Environment.baseApiUrl })
    
    this._storage = new SessionStorage()
    this._initializeResponseInterceptor()
  }

  private _initializeResponseInterceptor = () => {
    this._instance.interceptors.response.use(this._handleResponse, this._handleError)
  }


  //@ts-ignore
  private _handleError = (error: AxiosError) => Promise.reject(new CustomAxiosErrorResponse(error))
  private _handleResponse = (data : AxiosResponse) => data

  private _handleRequest = (config: AdaptAxiosRequestConfig) => {
    const ACCESS_TOKEN = this._storage.get(STORAGEKEYS.ACCESS_TOKEN)
    config.headers["Authorization"] = `bearer ${ACCESS_TOKEN}`
  
    return config;
  };

  public get<T>(url: string, isAuth: boolean = false, timeout: number = 10000): Promise<AxiosResponse<T>> {
    if (isAuth) {
      this._instance.interceptors.request.use(this._handleRequest);
    }

    return this._instance.get(url, {
      headers: { "content-type": "application/json" },
      timeout: timeout,
      withCredentials : true,
    })
  }

  public delete<T>(url: string, isAuth: boolean = false, timeout: number = 10000): Promise<AxiosResponse<T>> {
    if (isAuth) {
      this._instance.interceptors.request.use(this._handleRequest);
    }

    return this._instance.delete(url, {
      headers: { "content-type": "application/json" },
      timeout: timeout,
      withCredentials : true,
    })
  }

  public post<T, Body>(url: string, body: Body, isAuth: boolean = false, headers?: any ): Promise<AxiosResponse<T>> {
    if (isAuth) {
      this._instance.interceptors.request.use(this._handleRequest)
    }
    
    return this._instance.post(url, body, {
      headers: headers !== undefined? headers : { "content-type": "application/json" },
      withCredentials : true,
    })
  }

  public patch<T, Body>(url: string, body: Body, isAuth: boolean = false, headers?: any ): Promise<AxiosResponse<T>> {
    if (isAuth) {
      this._instance.interceptors.request.use(this._handleRequest)
    }
    
    return this._instance.patch(url, body, {
      headers: headers !== undefined? headers : { "content-type": "application/json" },
      withCredentials : true,
    })
  }

  public put<Body>(url: string, body: Body, isAuth: boolean = false): Promise<AxiosResponse> {
    if (isAuth) {
      this._instance.interceptors.request.use(this._handleRequest)
    }

    return this._instance.put(url, body, {
      headers: { "content-type": "application/json" },
      withCredentials : true,
    })
  }

  public upload<T>(url: string, body: FormData, isAuth: boolean = false): Promise<AxiosResponse<T>> {
    if (isAuth) {
      this._instance.interceptors.request.use(this._handleRequest)
    }

    return this._instance.post(url, body, {
      headers: { "content-type": "multipart/form-data" },
      withCredentials : true,
    })  
  }

//   public download (url: string, isAuth: boolean = false) : Promise<AxiosResponse<Blob>> {
//     if(isAuth){
//       this._instance.interceptors.request.use(this._handleRequest);
//     }

//     return this._instance.get(url, {
//       headers: { "content-type": "application/json" },
//       withCredentials : true,
//       responseType: 'blob'
//     })
//   }

  // public loginWithAccessToken(username: string, password: string): Promise<AxiosResponse<IAccessTokenResponseModel>> {
  //   const formData = new URLSearchParams();

  //   formData.append("username", username)
  //   formData.append("password", password)

  //   return this._instance.post("/login", formData.toString(), {
  //     headers: {
  //       "Access-Control-Allow-Origin": "*",
  //       "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  //     },
  //   })
  // }
}