import { useState, useEffect } from "react";
import { MapPin, Cloud, Sun, CloudRain, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

interface LocationData {
  city: string;
  country: string;
  region: string;
}

const LocationWeatherWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [location, setLocation] = useState<LocationData>({ city: "Loading...", country: "", region: "" });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Update date every minute
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    // Get user location and weather
    const fetchLocationAndWeather = async () => {
      try {
        // Get user's location using geolocation API
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // Mock location data (in a real app, you'd use a reverse geocoding API)
              setLocation({
                city: "Paris",
                country: "France",
                region: "Île-de-France"
              });

              // Mock weather data (in a real app, you'd use a weather API)
              setWeather({
                temperature: 18,
                condition: "Partly Cloudy",
                icon: "partly-cloudy",
                humidity: 65,
                windSpeed: 12
              });

              setIsLoading(false);
            },
            (error) => {
              console.log("Geolocation error:", error);
              // Fallback to default location
              setLocation({
                city: "Paris",
                country: "France",
                region: "Île-de-France"
              });
              setWeather({
                temperature: 18,
                condition: "Partly Cloudy",
                icon: "partly-cloudy",
                humidity: 65,
                windSpeed: 12
              });
              setIsLoading(false);
            }
          );
        } else {
          // Fallback if geolocation is not supported
          setLocation({
            city: "Paris",
            country: "France",
            region: "Île-de-France"
          });
          setWeather({
            temperature: 18,
            condition: "Partly Cloudy",
            icon: "partly-cloudy",
            humidity: 65,
            windSpeed: 12
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching location/weather:", error);
        setIsLoading(false);
      }
    };

    fetchLocationAndWeather();

    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun size={20} className="text-yellow-500" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud size={20} className="text-gray-500" />;
      case 'rainy':
      case 'rain':
        return <CloudRain size={20} className="text-blue-500" />;
      default:
        return <Cloud size={20} className="text-gray-500" />;
    }
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

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
      <CardContent className="p-2">
        {/* Compact layout with everything in one row */}
        <div className="flex items-center justify-between text-xs">
          {/* Date and Location */}
          <div className="flex items-center space-x-2">
            <MapPin size={12} />
            <span className="font-medium">{location.city}</span>
            <span className="opacity-80">•</span>
            <span>{formatDate(currentDate)}</span>
            <span>{formatTime(currentDate)}</span>
          </div>

          {/* Weather */}
          {weather && (
            <div className="flex items-center space-x-2">
              {getWeatherIcon(weather.condition)}
              <div className="flex items-center">
                <Thermometer size={12} className="mr-1" />
                <span className="font-bold">{weather.temperature}°C</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationWeatherWidget;
