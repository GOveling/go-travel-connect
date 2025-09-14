import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Users, TrendingUp, RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useGloballyPopularPlaces } from "@/hooks/useGloballyPopularPlaces";

interface PopularPlace {
  id: string;
  name: string;
  location: string;
  rating: number;
  image: string;
  category: string;
  description: string;
  globalSaves: number;
  hours: string;
  website: string;
  phone: string;
  lat: number;
  lng: number;
}

interface HomePopularPlaceProps {
  onPlaceClick: (place: any) => void;
}

// Mock data for popular places globally saved by users
const popularPlaces: PopularPlace[] = [
  {
    id: "santorini-sunset-point",
    name: "Santorini Sunset Point",
    location: "Santorini, Greece",
    rating: 4.9,
    image: "🌅",
    category: "Tourist Attractions",
    description:
      "One of the world's most photographed sunsets with breathtaking views over the Aegean Sea. A must-visit destination saved by millions of travelers.",
    globalSaves: 2847,
    hours: "Open 24/7",
    website: "www.santorini-tourism.com",
    phone: "+30 22860 22722",
    lat: 36.3932,
    lng: 25.4615,
  },
  {
    id: "kyoto-bamboo-grove",
    name: "Kyoto Bamboo Grove",
    location: "Kyoto, Japan",
    rating: 4.8,
    image: "🎋",
    category: "Parks",
    description:
      "Walk through thousands of towering bamboo stalks creating a natural cathedral. One of Japan's most serene and popular destinations.",
    globalSaves: 3156,
    hours: "6:00 AM - 6:00 PM",
    website: "www.kyoto-bamboo.jp",
    phone: "+81 75-211-1215",
    lat: 35.017,
    lng: 135.6728,
  },
  {
    id: "machu-picchu",
    name: "Machu Picchu",
    location: "Cusco, Peru",
    rating: 4.9,
    image: "🏔️",
    category: "Tourist Attractions",
    description:
      "Ancient Incan citadel set high in the Andes Mountains. A UNESCO World Heritage site and one of the New Seven Wonders of the World.",
    globalSaves: 4203,
    hours: "6:00 AM - 5:30 PM",
    website: "www.machupicchu.gob.pe",
    phone: "+51 84 211030",
    lat: -13.1631,
    lng: -72.545,
  },
  {
    id: "cafe-central-vienna",
    name: "Café Central",
    location: "Vienna, Austria",
    rating: 4.7,
    image: "☕",
    category: "Cafes",
    description:
      "Historic Viennese coffeehouse with traditional atmosphere and exceptional pastries. A cultural landmark loved by coffee enthusiasts worldwide.",
    globalSaves: 1892,
    hours: "7:30 AM - 10:00 PM",
    website: "www.cafecentral.wien",
    phone: "+43 1 533 37 64",
    lat: 48.2108,
    lng: 16.366,
  },
  {
    id: "northern-lights-lodge-tromso",
    name: "Northern Lights Lodge",
    location: "Tromsø, Norway",
    rating: 4.8,
    image: "🌌",
    category: "Hotels",
    description:
      "Experience the magical Aurora Borealis from cozy glass igloos. Perfect location for Northern Lights viewing with luxury amenities.",
    globalSaves: 2134,
    hours: "Check-in: 3:00 PM",
    website: "www.northernlightslodge.no",
    phone: "+47 77 75 50 00",
    lat: 69.6496,
    lng: 18.956,
  },
];

const HomePopularPlace = ({ onPlaceClick }: HomePopularPlaceProps) => {
  const { t } = useLanguage();
  const { places: globalPlaces, loading, error, refetch } = useGloballyPopularPlaces();
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds

  // Get current place (from real data or fallback to mock data)
  const getCurrentPlace = () => {
    if (globalPlaces.length > 0) {
      return {
        id: `global-${currentPlaceIndex}`,
        name: globalPlaces[currentPlaceIndex].name,
        location: globalPlaces[currentPlaceIndex].formatted_address || 
                 `${globalPlaces[currentPlaceIndex].city}, ${globalPlaces[currentPlaceIndex].country}`,
        rating: 4.5, // Default rating since we don't have rating data
        image: getCategoryEmoji(globalPlaces[currentPlaceIndex].category),
        category: globalPlaces[currentPlaceIndex].category,
        description: globalPlaces[currentPlaceIndex].description || 
                    `Popular ${globalPlaces[currentPlaceIndex].category.toLowerCase()} saved ${globalPlaces[currentPlaceIndex].save_count} times in the last hour`,
        globalSaves: globalPlaces[currentPlaceIndex].save_count,
        hours: "Check locally",
        website: "",
        phone: "",
        lat: globalPlaces[currentPlaceIndex].lat,
        lng: globalPlaces[currentPlaceIndex].lng,
      };
    }
    // Fallback to mock data if no real data available
    return popularPlaces[currentPlaceIndex % popularPlaces.length];
  };

  const getCategoryEmoji = (category: string) => {
    const categoryEmojiMap: { [key: string]: string } = {
      'tourist_attraction': '🏛️',
      'restaurant': '🍽️',
      'lodging': '🏨',
      'park': '🌳',
      'museum': '🏛️',
      'cafe': '☕',
      'shopping_mall': '🛍️',
      'church': '⛪',
      'beach': '🏖️',
      'default': '📍'
    };
    return categoryEmojiMap[category?.toLowerCase()] || categoryEmojiMap.default;
  };

  // Function to get next place
  const getNextPlace = () => {
    const maxLength = globalPlaces.length > 0 ? globalPlaces.length : popularPlaces.length;
    setCurrentPlaceIndex((prev) => (prev + 1) % Math.max(maxLength, 1));
  };

  // Initialize and set up rotation
  useEffect(() => {
    const interval = setInterval(() => {
      getNextPlace();
      setTimeRemaining(300); // Reset timer
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [globalPlaces.length]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRefresh = () => {
    if (globalPlaces.length > 0) {
      getNextPlace();
    } else {
      refetch(); // Refresh real data
    }
    setTimeRemaining(300);
  };

  const currentPlace = getCurrentPlace();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-orange-500" size={20} />
            <h3 className="text-xl font-semibold text-gray-800">
              {t("home.popularPlaces.popularPlaceGlobally")}
            </h3>
          </div>
        </div>
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-center h-24">
              <RefreshCw className="animate-spin text-purple-600" size={24} />
              <span className="ml-2 text-gray-600">Cargando lugares populares...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && globalPlaces.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-orange-500" size={20} />
            <h3 className="text-xl font-semibold text-gray-800">
              {t("home.popularPlaces.popularPlaceGlobally")}
            </h3>
          </div>
        </div>
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-orange-50">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-gray-600 mb-2">No hay datos suficientes en la última hora</p>
              <p className="text-xs text-gray-500">Mostrando lugares populares de muestra</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-orange-500" size={20} />
          <h3 className="text-xl font-semibold text-gray-800">
            {t("home.popularPlaces.popularPlaceGlobally")}
            {globalPlaces.length > 0 && (
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                EN VIVO
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {globalPlaces.length > 0 ? 
              `Top ${currentPlaceIndex + 1}/3 - ${t("home.popularPlaces.next")}: ${formatTime(timeRemaining)}` :
              `${t("home.popularPlaces.next")}: ${formatTime(timeRemaining)}`
            }
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-purple-600 h-8"
          >
            <RefreshCw size={14} className="mr-1" />
            {t("home.popularPlaces.refresh")}
          </Button>
        </div>
      </div>

      <Card
        className="overflow-hidden border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-orange-50"
        onClick={() => onPlaceClick(currentPlace)}
      >
        <CardContent className="p-0">
          <div className="flex">
            {/* Image Section */}
            <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-orange-200 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">{currentPlace.image}</span>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-base text-gray-800 mb-1">
                    {currentPlace.name}
                  </h4>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-600">
                      {currentPlace.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-medium">
                    {currentPlace.rating}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {currentPlace.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">
                    {currentPlace.globalSaves.toLocaleString()}{" "}
                    {t("home.popularPlaces.saves")}
                  </span>
                </div>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  {currentPlace.category}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePopularPlace;
