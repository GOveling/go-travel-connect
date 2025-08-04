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

  // Search locations using Weather API
  async searchLocations(query: string, countryCode?: string) {
    const searchQuery = countryCode ? `${query} ${countryCode}` : query;
    return this.get(`/weather/search?q=${encodeURIComponent(searchQuery)}`);
  }

  // Geo specific methods with enhanced API support
  async getCountries() {
    // Return expanded list of countries
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
      { country_code: 'IN', country_name: 'India', phone_code: '+91' },
      { country_code: 'RU', country_name: 'Russia', phone_code: '+7' },
      { country_code: 'ZA', country_name: 'South Africa', phone_code: '+27' },
      { country_code: 'EG', country_name: 'Egypt', phone_code: '+20' },
      { country_code: 'TH', country_name: 'Thailand', phone_code: '+66' },
      { country_code: 'TR', country_name: 'Turkey', phone_code: '+90' },
      { country_code: 'GR', country_name: 'Greece', phone_code: '+30' },
      { country_code: 'PT', country_name: 'Portugal', phone_code: '+351' },
      { country_code: 'NL', country_name: 'Netherlands', phone_code: '+31' },
      { country_code: 'BE', country_name: 'Belgium', phone_code: '+32' },
      { country_code: 'CH', country_name: 'Switzerland', phone_code: '+41' },
      { country_code: 'AT', country_name: 'Austria', phone_code: '+43' },
      { country_code: 'SE', country_name: 'Sweden', phone_code: '+46' },
      { country_code: 'NO', country_name: 'Norway', phone_code: '+47' },
      { country_code: 'DK', country_name: 'Denmark', phone_code: '+45' },
      { country_code: 'FI', country_name: 'Finland', phone_code: '+358' },
      { country_code: 'IE', country_name: 'Ireland', phone_code: '+353' },
      { country_code: 'IS', country_name: 'Iceland', phone_code: '+354' },
      { country_code: 'PL', country_name: 'Poland', phone_code: '+48' },
      { country_code: 'CZ', country_name: 'Czech Republic', phone_code: '+420' },
      { country_code: 'HU', country_name: 'Hungary', phone_code: '+36' },
      { country_code: 'RO', country_name: 'Romania', phone_code: '+40' },
      { country_code: 'BG', country_name: 'Bulgaria', phone_code: '+359' },
      { country_code: 'HR', country_name: 'Croatia', phone_code: '+385' },
      { country_code: 'SI', country_name: 'Slovenia', phone_code: '+386' },
      { country_code: 'SK', country_name: 'Slovakia', phone_code: '+421' },
      { country_code: 'LT', country_name: 'Lithuania', phone_code: '+370' },
      { country_code: 'LV', country_name: 'Latvia', phone_code: '+371' },
      { country_code: 'EE', country_name: 'Estonia', phone_code: '+372' },
      { country_code: 'VE', country_name: 'Venezuela', phone_code: '+58' },
      { country_code: 'UY', country_name: 'Uruguay', phone_code: '+598' },
      { country_code: 'PY', country_name: 'Paraguay', phone_code: '+595' },
      { country_code: 'BO', country_name: 'Bolivia', phone_code: '+591' },
      { country_code: 'EC', country_name: 'Ecuador', phone_code: '+593' },
      { country_code: 'CR', country_name: 'Costa Rica', phone_code: '+506' },
      { country_code: 'PA', country_name: 'Panama', phone_code: '+507' },
      { country_code: 'GT', country_name: 'Guatemala', phone_code: '+502' },
      { country_code: 'HN', country_name: 'Honduras', phone_code: '+504' },
      { country_code: 'NI', country_name: 'Nicaragua', phone_code: '+505' },
      { country_code: 'SV', country_name: 'El Salvador', phone_code: '+503' },
      { country_code: 'DO', country_name: 'Dominican Republic', phone_code: '+1' },
      { country_code: 'CU', country_name: 'Cuba', phone_code: '+53' },
      { country_code: 'JM', country_name: 'Jamaica', phone_code: '+1' },
      { country_code: 'KR', country_name: 'South Korea', phone_code: '+82' },
      { country_code: 'MY', country_name: 'Malaysia', phone_code: '+60' },
      { country_code: 'SG', country_name: 'Singapore', phone_code: '+65' },
      { country_code: 'PH', country_name: 'Philippines', phone_code: '+63' },
      { country_code: 'ID', country_name: 'Indonesia', phone_code: '+62' },
      { country_code: 'VN', country_name: 'Vietnam', phone_code: '+84' },
      { country_code: 'NZ', country_name: 'New Zealand', phone_code: '+64' },
      { country_code: 'IL', country_name: 'Israel', phone_code: '+972' },
      { country_code: 'AE', country_name: 'United Arab Emirates', phone_code: '+971' },
      { country_code: 'SA', country_name: 'Saudi Arabia', phone_code: '+966' },
      { country_code: 'QA', country_name: 'Qatar', phone_code: '+974' },
      { country_code: 'KW', country_name: 'Kuwait', phone_code: '+965' },
      { country_code: 'BH', country_name: 'Bahrain', phone_code: '+973' },
      { country_code: 'OM', country_name: 'Oman', phone_code: '+968' },
      { country_code: 'JO', country_name: 'Jordan', phone_code: '+962' },
      { country_code: 'LB', country_name: 'Lebanon', phone_code: '+961' },
      { country_code: 'MA', country_name: 'Morocco', phone_code: '+212' },
      { country_code: 'TN', country_name: 'Tunisia', phone_code: '+216' },
      { country_code: 'DZ', country_name: 'Algeria', phone_code: '+213' },
      { country_code: 'LY', country_name: 'Libya', phone_code: '+218' },
      { country_code: 'SD', country_name: 'Sudan', phone_code: '+249' },
      { country_code: 'ET', country_name: 'Ethiopia', phone_code: '+251' },
      { country_code: 'KE', country_name: 'Kenya', phone_code: '+254' },
      { country_code: 'TZ', country_name: 'Tanzania', phone_code: '+255' },
      { country_code: 'UG', country_name: 'Uganda', phone_code: '+256' },
      { country_code: 'RW', country_name: 'Rwanda', phone_code: '+250' },
      { country_code: 'GH', country_name: 'Ghana', phone_code: '+233' },
      { country_code: 'NG', country_name: 'Nigeria', phone_code: '+234' },
      { country_code: 'SN', country_name: 'Senegal', phone_code: '+221' },
      { country_code: 'CI', country_name: 'Ivory Coast', phone_code: '+225' },
      { country_code: 'ML', country_name: 'Mali', phone_code: '+223' },
      { country_code: 'BF', country_name: 'Burkina Faso', phone_code: '+226' },
      { country_code: 'NE', country_name: 'Niger', phone_code: '+227' },
      { country_code: 'TD', country_name: 'Chad', phone_code: '+235' },
      { country_code: 'CF', country_name: 'Central African Republic', phone_code: '+236' },
      { country_code: 'CM', country_name: 'Cameroon', phone_code: '+237' },
      { country_code: 'GA', country_name: 'Gabon', phone_code: '+241' },
      { country_code: 'CG', country_name: 'Republic of the Congo', phone_code: '+242' },
      { country_code: 'CD', country_name: 'Democratic Republic of the Congo', phone_code: '+243' },
      { country_code: 'AO', country_name: 'Angola', phone_code: '+244' },
      { country_code: 'ZM', country_name: 'Zambia', phone_code: '+260' },
      { country_code: 'ZW', country_name: 'Zimbabwe', phone_code: '+263' },
      { country_code: 'BW', country_name: 'Botswana', phone_code: '+267' },
      { country_code: 'NA', country_name: 'Namibia', phone_code: '+264' },
      { country_code: 'SZ', country_name: 'Eswatini', phone_code: '+268' },
      { country_code: 'LS', country_name: 'Lesotho', phone_code: '+266' },
      { country_code: 'MZ', country_name: 'Mozambique', phone_code: '+258' },
      { country_code: 'MG', country_name: 'Madagascar', phone_code: '+261' },
      { country_code: 'MU', country_name: 'Mauritius', phone_code: '+230' },
      { country_code: 'SC', country_name: 'Seychelles', phone_code: '+248' },
      { country_code: 'RE', country_name: 'Réunion', phone_code: '+262' },
      { country_code: 'YT', country_name: 'Mayotte', phone_code: '+262' }
    ];
  }

  async getCitiesByCountry(countryCode: string) {
    try {
      // Use Weather API to search for major cities by country
      const response = await this.searchLocations(`capital ${countryCode}`);
      
      if (response?.data && Array.isArray(response.data)) {
        return response.data.map((location: any) => ({
          city: location.name,
          latitude: location.lat,
          longitude: location.lon,
          population: 0, // Weather API doesn't provide population
          country_code: countryCode
        }));
      }
    } catch (error) {
      console.warn('Weather API search failed, using fallback cities:', error);
    }

    // Fallback to static cities for main countries
    const citiesByCountry: Record<string, any[]> = {
      'US': [
        { city: 'New York', latitude: 40.7128, longitude: -74.0060, population: 8000000, country_code: 'US' },
        { city: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, population: 4000000, country_code: 'US' },
        { city: 'Chicago', latitude: 41.8781, longitude: -87.6298, population: 2700000, country_code: 'US' },
        { city: 'Houston', latitude: 29.7604, longitude: -95.3698, population: 2300000, country_code: 'US' },
        { city: 'Phoenix', latitude: 33.4484, longitude: -112.0740, population: 1700000, country_code: 'US' },
        { city: 'Philadelphia', latitude: 39.9526, longitude: -75.1652, population: 1600000, country_code: 'US' },
        { city: 'San Antonio', latitude: 29.4241, longitude: -98.4936, population: 1500000, country_code: 'US' },
        { city: 'San Diego', latitude: 32.7157, longitude: -117.1611, population: 1400000, country_code: 'US' },
        { city: 'Dallas', latitude: 32.7767, longitude: -96.7970, population: 1300000, country_code: 'US' },
        { city: 'San Jose', latitude: 37.3382, longitude: -121.8863, population: 1000000, country_code: 'US' }
      ],
      'ES': [
        { city: 'Madrid', latitude: 40.4168, longitude: -3.7038, population: 3200000, country_code: 'ES' },
        { city: 'Barcelona', latitude: 41.3851, longitude: 2.1734, population: 1600000, country_code: 'ES' },
        { city: 'Valencia', latitude: 39.4699, longitude: -0.3763, population: 800000, country_code: 'ES' },
        { city: 'Sevilla', latitude: 37.3891, longitude: -5.9845, population: 700000, country_code: 'ES' },
        { city: 'Zaragoza', latitude: 41.6488, longitude: -0.8891, population: 670000, country_code: 'ES' },
        { city: 'Málaga', latitude: 36.7213, longitude: -4.4214, population: 570000, country_code: 'ES' },
        { city: 'Murcia', latitude: 37.9923, longitude: -1.1307, population: 450000, country_code: 'ES' },
        { city: 'Palma', latitude: 39.5696, longitude: 2.6502, population: 410000, country_code: 'ES' },
        { city: 'Las Palmas', latitude: 28.1248, longitude: -15.4300, population: 380000, country_code: 'ES' },
        { city: 'Bilbao', latitude: 43.2630, longitude: -2.9350, population: 350000, country_code: 'ES' }
      ],
      'FR': [
        { city: 'Paris', latitude: 48.8566, longitude: 2.3522, population: 2200000, country_code: 'FR' },
        { city: 'Marseille', latitude: 43.2965, longitude: 5.3698, population: 860000, country_code: 'FR' },
        { city: 'Lyon', latitude: 45.7640, longitude: 4.8357, population: 500000, country_code: 'FR' },
        { city: 'Toulouse', latitude: 43.6047, longitude: 1.4442, population: 470000, country_code: 'FR' },
        { city: 'Nice', latitude: 43.7102, longitude: 7.2620, population: 340000, country_code: 'FR' },
        { city: 'Nantes', latitude: 47.2184, longitude: -1.5536, population: 310000, country_code: 'FR' },
        { city: 'Strasbourg', latitude: 48.5734, longitude: 7.7521, population: 280000, country_code: 'FR' },
        { city: 'Montpellier', latitude: 43.6110, longitude: 3.8767, population: 280000, country_code: 'FR' },
        { city: 'Bordeaux', latitude: 44.8378, longitude: -0.5792, population: 250000, country_code: 'FR' },
        { city: 'Lille', latitude: 50.6292, longitude: 3.0573, population: 230000, country_code: 'FR' }
      ],
      'MX': [
        { city: 'Mexico City', latitude: 19.4326, longitude: -99.1332, population: 9000000, country_code: 'MX' },
        { city: 'Guadalajara', latitude: 20.6597, longitude: -103.3496, population: 1500000, country_code: 'MX' },
        { city: 'Monterrey', latitude: 25.6866, longitude: -100.3161, population: 1100000, country_code: 'MX' },
        { city: 'Puebla', latitude: 19.0414, longitude: -98.2063, population: 1500000, country_code: 'MX' },
        { city: 'Tijuana', latitude: 32.5149, longitude: -117.0382, population: 1640000, country_code: 'MX' },
        { city: 'León', latitude: 21.1619, longitude: -101.6921, population: 1500000, country_code: 'MX' },
        { city: 'Juárez', latitude: 31.6904, longitude: -106.4245, population: 1400000, country_code: 'MX' },
        { city: 'Torreón', latitude: 25.5428, longitude: -103.4068, population: 690000, country_code: 'MX' },
        { city: 'Querétaro', latitude: 20.5888, longitude: -100.3899, population: 880000, country_code: 'MX' },
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
