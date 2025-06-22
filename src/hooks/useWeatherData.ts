import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setWeatherLoading,
  setWeatherData,
  setWeatherError,
  updateLocation
} from '../store/slices/weatherSlice';
import { weatherService } from '../services/weatherService';
import { LocationCoordinates } from '../services/types';

export const useWeatherData = () => {
  const dispatch = useDispatch();
  const weatherState = useSelector((state: RootState) => state.weather);
  const currentData = weatherState.data;

  const fetchWeather = useCallback(async (coordinates?: LocationCoordinates, city?: string) => {
    try {
      dispatch(setWeatherLoading(true));
      const newWeatherData = await weatherService.getCurrentWeather(coordinates, city);

      const isSameData = currentData &&
        currentData.temperature === newWeatherData.temperature &&
        currentData.condition === newWeatherData.condition &&
        currentData.location.city === newWeatherData.location.city;

      if (!isSameData) {
      console.log("📦 Nuevo weatherData detectado, actualizando store...");
      dispatch(setWeatherData(newWeatherData));
    } else {
      console.log("⚠️ WeatherData no ha cambiado, no se actualiza.");
      dispatch(setWeatherLoading(false));
    }


      return newWeatherData;
    } catch (error: any) {
      dispatch(setWeatherError(error.message || 'Failed to fetch weather data'));
      throw error;
    }
  }, [dispatch, currentData]);

  const fetchWeatherByLocation = useCallback(async () => {
    console.log('Fetching weather by location...');
    if (!navigator.geolocation) {
      dispatch(setWeatherError('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchWeather({ lat: latitude, lng: longitude });
      },
      () => {
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
