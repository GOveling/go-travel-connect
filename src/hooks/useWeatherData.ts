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

// Mensajes motivacionales de fallback
const FALLBACK_MESSAGES = [
  "¡Hoy es un excelente día para viajar!",
  "¿Qué te parece si nos vamos de viaje?",
  "El mundo está esperando a ser explorado",
  "Cada día es perfecto para una nueva aventura",
  "Tu próximo destino te está llamando",
  "Convierte este día en una experiencia inolvidable",
  "El mejor momento para viajar es ahora",
];

export const useWeatherData = () => {
  const dispatch = useDispatch();
  const weatherState = useSelector((state: RootState) => state.weather);
  const currentData = weatherState.data;
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAttemptRef = useRef<number>(0);

  // Cache y configuración
  const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos
  const RETRY_INTERVAL = 60 * 60 * 1000; // 1 hora para reintentos
  const MIN_RETRY_DELAY = 5 * 60 * 1000; // 5 minutos mínimo entre intentos

  // Función para obtener mensaje motivacional aleatorio
  const getRandomFallbackMessage = () => {
    const randomIndex = Math.floor(Math.random() * FALLBACK_MESSAGES.length);
    return FALLBACK_MESSAGES[randomIndex];
  };

  // Función para crear datos de fallback
  const createFallbackData = useCallback(
    () => ({
      temperature: 22,
      condition: "Pleasant",
      icon: "sun",
      humidity: 65,
      windSpeed: 10,
      location: {
        city: getRandomFallbackMessage(),
        country: "",
        region: "",
      },
    }),
    []
  );

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

        // Si no hay datos en caché, mostrar datos de fallback
        if (!currentData) {
          console.log("🎯 WeatherData: Sin datos en caché, mostrando fallback");
          const fallbackData = createFallbackData();
          dispatch(setWeatherData(fallbackData));
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
    [
      dispatch,
      currentData,
      weatherState.error,
      MIN_RETRY_DELAY,
      RETRY_INTERVAL,
      createFallbackData,
    ]
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
  };
};
