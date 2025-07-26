import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useReduxAuth } from "@/hooks/useReduxAuth";
import { useWeatherData } from "@/hooks/useWeatherData";
import {
  Cloud,
  CloudRain,
  Coffee,
  Compass,
  Heart,
  MapPin,
  Sun,
  Thermometer,
} from "lucide-react";
import { useEffect, useState } from "react";

const LocationWeatherWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const {
    weatherData,
    isLoading,
    fetchWeatherByLocation,
    isDataStale,
    error,
    getRandomFallbackMessage,
  } = useWeatherData();
  const { isAuthenticated } = useReduxAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && (!weatherData || isDataStale())) {
      fetchWeatherByLocation();
    }
  }, [
    isAuthenticated,
    isLoading,
    weatherData,
    isDataStale,
    fetchWeatherByLocation,
  ]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun size={20} className="text-yellow-500" />;
      case "cloudy":
      case "partly cloudy":
        return <Cloud size={20} className="text-gray-500" />;
      case "rainy":
      case "rain":
        return <CloudRain size={20} className="text-blue-500" />;
      case "pleasant":
        return <Heart size={20} className="text-pink-500" />;
      default:
        return <Cloud size={20} className="text-gray-500" />;
    }
  };

  // Función para determinar si estamos mostrando mensaje motivacional
  const isMotivationalMessage = (cityName: string) => {
    const motivationalKeywords = [
      t("home.weather.motivationalKeywords.excellentDay"),
      t("home.weather.motivationalKeywords.letsTravel"),
      t("home.weather.motivationalKeywords.worldWaiting"),
      t("home.weather.motivationalKeywords.newAdventure"),
      t("home.weather.motivationalKeywords.destinationCalling"),
      t("home.weather.motivationalKeywords.unforgettableExperience"),
      t("home.weather.motivationalKeywords.timeToTravel"),
    ];
    return motivationalKeywords.some((keyword) =>
      cityName.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Función para obtener ícono motivacional
  const getMotivationalIcon = () => {
    const icons = [
      <Heart size={12} className="text-pink-500" />,
      <Coffee size={12} className="text-amber-500" />,
      <Compass size={12} className="text-blue-500" />,
      <Sun size={12} className="text-yellow-500" />,
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
        <CardContent className="p-2">
          <div className="animate-pulse">
            <div className="h-3 bg-white bg-opacity-30 rounded mb-1"></div>
            <div className="h-2 bg-white bg-opacity-20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Solo mostrar mensaje motivacional si hay error Y no hay datos en caché
  if (error && !weatherData) {
    const motivationalMessage = getRandomFallbackMessage();

    return (
      <Card className="bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0 shadow-lg">
        <CardContent className="p-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 flex-1">
              {getMotivationalIcon()}
              <span className="font-medium text-xs leading-tight">
                {motivationalMessage}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si no hay datos de clima en absoluto (sin error específico), también mostrar fallback
  if (!weatherData) {
    const motivationalMessage = getRandomFallbackMessage();

    return (
      <Card className="bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0 shadow-lg">
        <CardContent className="p-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 flex-1">
              {getMotivationalIcon()}
              <span className="font-medium text-xs leading-tight">
                {motivationalMessage}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si hay datos de clima válidos, mostrar información normal
  const isMotivational = isMotivationalMessage(weatherData.location.city);

  return (
    <Card
      className={`${
        isMotivational
          ? "bg-gradient-to-r from-pink-500 to-orange-500"
          : "bg-gradient-to-r from-blue-500 to-purple-600"
      } text-white border-0 shadow-lg`}
    >
      <CardContent className="p-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 flex-1">
            {isMotivational ? (
              <>
                {getMotivationalIcon()}
                <span className="font-medium text-xs leading-tight">
                  {weatherData.location.city}
                </span>
              </>
            ) : (
              <>
                <MapPin size={12} />
                <span className="font-medium">{weatherData.location.city}</span>
                <span className="opacity-80">•</span>
                <span>{formatDate(currentDate)}</span>
              </>
            )}
          </div>

          {!isMotivational && (
            <div className="flex items-center space-x-2">
              {getWeatherIcon(weatherData.condition)}
              <div className="flex items-center">
                <Thermometer size={12} className="mr-1" />
                <span className="font-bold">{weatherData.temperature}°C</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationWeatherWidget;
