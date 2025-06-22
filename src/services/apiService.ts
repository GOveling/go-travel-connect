
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store';
import { setError as setAuthError } from '../store/slices/authSlice';
import { ApiResponse, ApiError } from './types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Replace with your Nest.js backend URL
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-nestjs-backend.com/api' 
      : 'http://localhost:3001/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add Bearer token
    this.api.interceptors.request.use(
      (config) => {
        const state = store.getState();
        const token = state.auth.token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data,
        });
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(`API Response: ${response.status}`, response.data);
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token
          store.dispatch(setAuthError('Session expired. Please login again.'));
        }
        
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          statusCode: error.response?.status || 500,
          error: error.response?.data?.error,
        };
        
        return Promise.reject(apiError);
      }
    );
  }

  // Generic API methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Weather specific methods
  async getWeatherByCoordinates(lat: number, lng: number) {
    return this.get(`/weather/coordinates?lat=${lat}&lng=${lng}`);
  }

  async getWeatherByCity(city: string) {
    return this.get(`/weather/city?city=${encodeURIComponent(city)}`);
  }

  // Places specific methods
  async getPlacesByCategory(category: string) {
    return this.get(`/places/category/${category}`);
  }

  async getPlaceDetails(placeId: string) {
    return this.get(`/places/${placeId}`);
  }

  async getNearbyPlaces(lat: number, lng: number, radius?: number) {
    return this.get(`/places/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5000}`);
  }

  // User specific methods
  async getUserProfile(userId: string) {
    return this.get(`/users/${userId}`);
  }

  async updateUserProfile(userId: string, data: any) {
    return this.put(`/users/${userId}`, data);
  }
}

export const apiService = new ApiService();
export default apiService;
