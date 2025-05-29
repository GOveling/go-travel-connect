
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-white bg-opacity-30 rounded mb-2"></div>
            <div className="h-3 bg-white bg-opacity-20 rounded mb-2"></div>
            <div className="h-3 bg-white bg-opacity-20 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
      <CardContent className="p-4">
        {/* Date and Time */}
        <div className="text-center mb-3">
          <p className="text-lg font-semibold">{formatDate(currentDate)}</p>
          <p className="text-sm opacity-90">{formatTime(currentDate)}</p>
        </div>

        {/* Location */}
        <div className="flex items-center justify-center mb-3">
          <MapPin size={16} className="mr-2" />
          <div className="text-center">
            <p className="font-medium">{location.city}, {location.country}</p>
            <p className="text-xs opacity-80">{location.region}</p>
          </div>
        </div>

        {/* Weather */}
        {weather && (
          <div className="flex items-center justify-between bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center">
              {getWeatherIcon(weather.condition)}
              <div className="ml-3">
                <p className="font-medium">{weather.condition}</p>
                <p className="text-xs opacity-80">{weather.humidity}% humidity</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center">
                <Thermometer size={16} className="mr-1" />
                <span className="text-2xl font-bold">{weather.temperature}°C</span>
              </div>
              <p className="text-xs opacity-80">{weather.windSpeed} km/h wind</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationWeatherWidget;
