
import { apiService } from './apiService';
import { WeatherApiResponse, LocationCoordinates } from './types';

export class WeatherService {
  async getCurrentWeather(coordinates?: LocationCoordinates, city?: string): Promise<WeatherApiResponse> {
    try {
      let response;
      
      if (coordinates) {
        response = await apiService.getWeatherByCoordinates(coordinates.lat, coordinates.lng);
      } else if (city) {
        response = await apiService.getWeatherByCity(city);
      } else {
        throw new Error('Either coordinates or city must be provided');
      }
      
      return response.data;
    } catch (error) {
      console.error('Weather service error:', error);
      throw error;
    }
  }

  async getWeatherForecast(coordinates: LocationCoordinates, days: number = 5) {
    try {
      const response = await apiService.get(`/weather/forecast?lat=${coordinates.lat}&lng=${coordinates.lng}&days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Weather forecast error:', error);
      throw error;
    }
  }
}

export const weatherService = new WeatherService();
