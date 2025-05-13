// lib/axios.ts

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { toast } from 'react-toastify';
import { extractErrorMessage } from '../../../utils/errorHandler';
import { ApiError } from '@/types/error';


// Types for API response
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
}

// Error response type



class AxiosService {
  private static instance: AxiosService;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://multisig-escrow-backend.onrender.com/',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): AxiosService {
    if (!AxiosService.instance) {
      AxiosService.instance = new AxiosService();
    }
    return AxiosService.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem('token');

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        console.log("error", error)
        // Handle specific error cases
        if (error.response?.status === 403) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      
       

        // Transform error to consistent format
        // const apiError: ApiError = {
        //   message: (error.response?.data as { message?: string })?.message || 'An unexpected error occurred',
        //   status: error.response?.status || 500,
        //   code: error.code
        // };

        const apiError: ApiError = {
          message: extractErrorMessage(error),
          status: error.response?.status || 500,
          code: error.code
        };
        

        return Promise.reject(apiError);
      }
    );
  }

  // Generic request method
  public async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<ApiResponse<T>>(config);
      return { data: response.data, status: response.status, message: response.statusText } as ApiResponse<T>;
    } catch (error) {
      throw error;
    }
  }

  // Convenience methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

// Export singleton instance
export const axiosService = AxiosService.getInstance();