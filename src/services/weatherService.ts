import { apiService } from "./apiService";
import { LocationCoordinates } from "./types";

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  location: {
    city: string;
    country: string;
    region: string;
  };
}

export class WeatherService {
  async getCurrentWeather(
    coordinates?: LocationCoordinates,
    city?: string
  ): Promise<WeatherData> {
    try {
      let data;

      if (coordinates) {
        data = await apiService.getWeatherByCoordinates(
          coordinates.lat,
          coordinates.lng
        );
      } else if (city) {
        data = await apiService.getWeatherByCity(city);
      } else {
        throw new Error("Either coordinates or city must be provided");
      }

      // ✅ Mapeo correcto del backend al formato esperado por Redux
      const weatherData: WeatherData = {
        temperature: data.temperature_c,
        condition: data.condition,
        icon: data.icon,
        humidity: data.humidity,
        windSpeed: data.wind_kph,
        location: {
          city: data.location.name,
          country: data.location.country,
          region: data.location.region,
        },
      };

      return weatherData;
    } catch (error) {
      console.error("Weather service error:", error);
      throw error;
    }
  }

  async getWeatherForecast(
    coordinates: LocationCoordinates,
    days: number = 5
  ): Promise<any> {
    try {
      const response = await apiService.get(
        `/weather/forecast?lat=${coordinates.lat}&lng=${coordinates.lng}&days=${days}`
      );
      return response;
    } catch (error) {
      console.error("Weather forecast error:", error);
      throw error;
    }
  }
}

export const weatherService = new WeatherService();
