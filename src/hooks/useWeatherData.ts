
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setWeatherLoading, setWeatherData, setWeatherError, updateLocation } from '../store/slices/weatherSlice';
import { weatherService } from '../services/weatherService';
import { LocationCoordinates } from '../services/types';

export const useWeatherData = () => {
  const dispatch = useDispatch();
  const weatherState = useSelector((state: RootState) => state.weather);

  const fetchWeather = useCallback(async (coordinates?: LocationCoordinates, city?: string) => {
    try {
      dispatch(setWeatherLoading(true));
      const weatherData = await weatherService.getCurrentWeather(coordinates, city);
      dispatch(setWeatherData(weatherData));
      return weatherData;
    } catch (error: any) {
      dispatch(setWeatherError(error.message || 'Failed to fetch weather data'));
      throw error;
    }
  }, [dispatch]);

  const fetchWeatherByLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      dispatch(setWeatherError('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchWeather({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Fallback to default location (Paris)
        fetchWeather(undefined, 'Paris, France');
      }
    );
  }, [fetchWeather]);

  const updateWeatherLocation = useCallback((location: { city: string; country: string; region: string }) => {
    dispatch(updateLocation(location));
  }, [dispatch]);

  const isDataStale = useCallback(() => {
    if (!weatherState.lastUpdated) return true;
    const fifteenMinutes = 15 * 60 * 1000;
    return Date.now() - weatherState.lastUpdated > fifteenMinutes;
  }, [weatherState.lastUpdated]);

  return {
    weatherData: weatherState.data,
    isLoading: weatherState.isLoading,
    error: weatherState.error,
    lastUpdated: weatherState.lastUpdated,
    fetchWeather,
    fetchWeatherByLocation,
    updateWeatherLocation,
    isDataStale,
  };
};
