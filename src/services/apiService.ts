import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { store } from "../store";
import { setError as setAuthError } from "../store/slices/authSlice";
import { ApiResponse, ApiError } from "./types";
import { supabase } from "@/integrations/supabase/client";

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = "https://goveling-api.onrender.com";

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
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

        console.log(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`,
          {
            headers: config.headers,
            data: config.data,
          }
        );

        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
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
        console.error("API Error:", error.response?.data || error.message);

        if (error.response?.status === 401) {
          // Handle unauthorized - clear token
          store.dispatch(setAuthError("Session expired. Please login again."));
        }

        const apiError: ApiError = {
          message:
            error.response?.data?.message ||
            error.message ||
            "An error occurred",
          statusCode: error.response?.status || 500,
          error: error.response?.data?.error,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Generic API methods
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  async getWeatherByCoordinates(lat: number, lng: number) {
    return this.post("/weather", { lat, lng });
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
    return this.get(
      `/places/nearby?lat=${lat}&lng=${lng}&radius=${radius || 5000}`
    );
  }

  // Geo specific methods with static data (fallback)
  async getCountries() {
    // Return static list of common countries
    return [
      { country_code: 'US', country_name: 'United States', phone_code: '+1' },
      { country_code: 'GB', country_name: 'United Kingdom', phone_code: '+44' },
      { country_code: 'CA', country_name: 'Canada', phone_code: '+1' },
      { country_code: 'ES', country_name: 'Spain', phone_code: '+34' },
      { country_code: 'FR', country_name: 'France', phone_code: '+33' },
      { country_code: 'DE', country_name: 'Germany', phone_code: '+49' },
      { country_code: 'IT', country_name: 'Italy', phone_code: '+39' },
      { country_code: 'MX', country_name: 'Mexico', phone_code: '+52' },
      { country_code: 'AR', country_name: 'Argentina', phone_code: '+54' },
      { country_code: 'BR', country_name: 'Brazil', phone_code: '+55' },
      { country_code: 'CO', country_name: 'Colombia', phone_code: '+57' },
      { country_code: 'CL', country_name: 'Chile', phone_code: '+56' },
      { country_code: 'PE', country_name: 'Peru', phone_code: '+51' },
      { country_code: 'AU', country_name: 'Australia', phone_code: '+61' },
      { country_code: 'JP', country_name: 'Japan', phone_code: '+81' },
      { country_code: 'CN', country_name: 'China', phone_code: '+86' },
      { country_code: 'IN', country_name: 'India', phone_code: '+91' }
    ];
  }

  async getCitiesByCountry(countryCode: string) {
    // Return static cities based on country code
    const citiesByCountry: Record<string, any[]> = {
      'US': [
        { city: 'New York', latitude: 40.7128, longitude: -74.0060, population: 8000000, country_code: 'US' },
        { city: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, population: 4000000, country_code: 'US' },
        { city: 'Chicago', latitude: 41.8781, longitude: -87.6298, population: 2700000, country_code: 'US' },
        { city: 'Houston', latitude: 29.7604, longitude: -95.3698, population: 2300000, country_code: 'US' },
        { city: 'Phoenix', latitude: 33.4484, longitude: -112.0740, population: 1700000, country_code: 'US' }
      ],
      'ES': [
        { city: 'Madrid', latitude: 40.4168, longitude: -3.7038, population: 3200000, country_code: 'ES' },
        { city: 'Barcelona', latitude: 41.3851, longitude: 2.1734, population: 1600000, country_code: 'ES' },
        { city: 'Valencia', latitude: 39.4699, longitude: -0.3763, population: 800000, country_code: 'ES' },
        { city: 'Sevilla', latitude: 37.3891, longitude: -5.9845, population: 700000, country_code: 'ES' },
        { city: 'Bilbao', latitude: 43.2630, longitude: -2.9350, population: 350000, country_code: 'ES' }
      ],
      'FR': [
        { city: 'Paris', latitude: 48.8566, longitude: 2.3522, population: 2200000, country_code: 'FR' },
        { city: 'Lyon', latitude: 45.7640, longitude: 4.8357, population: 500000, country_code: 'FR' },
        { city: 'Marseille', latitude: 43.2965, longitude: 5.3698, population: 860000, country_code: 'FR' },
        { city: 'Nice', latitude: 43.7102, longitude: 7.2620, population: 340000, country_code: 'FR' }
      ],
      'MX': [
        { city: 'Mexico City', latitude: 19.4326, longitude: -99.1332, population: 9000000, country_code: 'MX' },
        { city: 'Guadalajara', latitude: 20.6597, longitude: -103.3496, population: 1500000, country_code: 'MX' },
        { city: 'Monterrey', latitude: 25.6866, longitude: -100.3161, population: 1100000, country_code: 'MX' },
        { city: 'Cancún', latitude: 21.1619, longitude: -86.8515, population: 700000, country_code: 'MX' }
      ]
    };

    return citiesByCountry[countryCode] || [];
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
