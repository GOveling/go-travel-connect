import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LocationCoordinates } from "../services/types";
import { weatherService } from "../services/weatherService";
import { RootState } from "../store";
import {
  setWeatherData,
  setWeatherError,
  setWeatherLoading,
  updateLocation,
} from "../store/slices/weatherSlice";
import { useLanguage } from "./useLanguage";

export const useWeatherData = () => {
  const dispatch = useDispatch();
  const weatherState = useSelector((state: RootState) => state.weather);
  const currentData = weatherState.data;
  const { t } = useLanguage();

  // Mensajes motivacionales de fallback usando i18n
  const getFallbackMessages = useCallback(
    () => [
      t("home.weather.fallbackMessages.excellentDay"),
      t("home.weather.fallbackMessages.letsTravel"),
      t("home.weather.fallbackMessages.worldWaiting"),
      t("home.weather.fallbackMessages.newAdventure"),
      t("home.weather.fallbackMessages.destinationCalling"),
      t("home.weather.fallbackMessages.unforgettableExperience"),
      t("home.weather.fallbackMessages.bestTime"),
    ],
    [t]
  );
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAttemptRef = useRef<number>(0);

  // Cache y configuración
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos
  const RETRY_INTERVAL = 60 * 60 * 1000; // 1 hora para reintentos
  const MIN_RETRY_DELAY = 5 * 60 * 1000; // 5 minutos mínimo entre intentos

  // Función para obtener mensaje motivacional aleatorio
  const getRandomFallbackMessage = useCallback(() => {
    const fallbackMessages = getFallbackMessages();
    const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
    return fallbackMessages[randomIndex];
  }, [getFallbackMessages]);

  const fetchWeather = useCallback(
    async (
      coordinates?: LocationCoordinates,
      city?: string,
      isRetry: boolean = false
    ) => {
      try {
        // Verificar si es muy pronto para un nuevo intento
        const now = Date.now();
        if (isRetry && now - lastAttemptRef.current < MIN_RETRY_DELAY) {
          console.log(
            "🕒 WeatherData: Muy pronto para reintentar, esperando..."
          );
          return;
        }

        lastAttemptRef.current = now;

        if (!isRetry) {
          dispatch(setWeatherLoading(true));
        }

        console.log(
          `🌤️ WeatherData: Obteniendo clima... ${isRetry ? "(reintento)" : ""}`
        );

        const newWeatherData = await weatherService.getCurrentWeather(
          coordinates,
          city
        );

        const isSameData =
          currentData &&
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

        // Limpiar error si existía
        if (weatherState.error) {
          dispatch(setWeatherError(null));
        }

        // Cancelar cualquier reintento programado
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }

        return newWeatherData;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch weather data";
        console.error("❌ WeatherData Error:", errorMessage);

        if (!isRetry) {
          dispatch(setWeatherError(errorMessage));
        }

        // Si hay datos en caché, limpiar el error y continuar usando los datos en caché
        if (currentData) {
          console.log(
            "🔄 WeatherData: Error en API pero usando datos en caché"
          );
          dispatch(setWeatherError(null)); // Limpiar error ya que tenemos datos válidos
          dispatch(setWeatherLoading(false));
        } else {
          // Si no hay datos en caché, mantener el error marcado
          console.log("🎯 WeatherData: Sin datos en caché y error en API");
          dispatch(setWeatherError(errorMessage));
          dispatch(setWeatherLoading(false));
        }

        // Programar reintento en 1 hora
        if (!retryTimeoutRef.current) {
          console.log(
            `🔄 WeatherData: Programando reintento en ${RETRY_INTERVAL / 1000 / 60} minutos`
          );
          retryTimeoutRef.current = setTimeout(() => {
            console.log("🔄 WeatherData: Ejecutando reintento automático");
            fetchWeather(coordinates, city, true);
          }, RETRY_INTERVAL);
        }

        if (!isRetry) {
          dispatch(setWeatherLoading(false));
        }

        throw error;
      }
    },
    [dispatch, currentData, weatherState.error, MIN_RETRY_DELAY, RETRY_INTERVAL]
  );

  const fetchWeatherByLocation = useCallback(async () => {
    console.log("Fetching weather by location...");
    if (!navigator.geolocation) {
      dispatch(setWeatherError("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchWeather({ lat: latitude, lng: longitude });
      },
      () => {
        fetchWeather(undefined, "Paris, France");
      }
    );
  }, [fetchWeather, dispatch]);

  const updateWeatherLocation = useCallback(
    (location: { city: string; country: string; region: string }) => {
      dispatch(updateLocation(location));
    },
    [dispatch]
  );

  const isDataStale = useCallback(() => {
    if (!weatherState.lastUpdated) return true;
    const oneHour = CACHE_DURATION; // 1 hora
    return Date.now() - weatherState.lastUpdated > oneHour;
  }, [weatherState.lastUpdated, CACHE_DURATION]);

  // Cleanup del timeout al desmontar
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    weatherData: weatherState.data,
    isLoading: weatherState.isLoading,
    error: weatherState.error,
    lastUpdated: weatherState.lastUpdated,
    fetchWeather,
    fetchWeatherByLocation,
    updateWeatherLocation,
    isDataStale,
    getRandomFallbackMessage,
  };
};
