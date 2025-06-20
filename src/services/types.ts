
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface WeatherApiResponse {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  location: {
    city: string;
    country: string;
    region: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface PlaceApiData {
  id: string;
  name: string;
  location: string;
  coordinates: LocationCoordinates;
  category: string;
  rating?: number;
  description?: string;
}
