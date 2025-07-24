import { useState, useEffect } from "react";
import { MapPin, Cloud, Sun, CloudRain, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useWeatherData } from "@/hooks/useWeatherData";
import { useReduxAuth } from "@/hooks/useReduxAuth";

const LocationWeatherWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { weatherData, isLoading, fetchWeatherByLocation, isDataStale } =
    useWeatherData();
  const { isAuthenticated } = useReduxAuth();

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
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
      default:
        return <Cloud size={20} className="text-gray-500" />;
    }
  };

  if (isLoading || !weatherData) {
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

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
      <CardContent className="p-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <MapPin size={12} />
            <span className="font-medium">{weatherData.location.city}</span>
            <span className="opacity-80">•</span>
            <span>{formatDate(currentDate)}</span>
            <span>{formatTime(currentDate)}</span>
          </div>

          <div className="flex items-center space-x-2">
            {getWeatherIcon(weatherData.condition)}
            <div className="flex items-center">
              <Thermometer size={12} className="mr-1" />
              <span className="font-bold">{weatherData.temperature}°C</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationWeatherWidget;
