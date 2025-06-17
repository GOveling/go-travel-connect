
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Users, TrendingUp } from "lucide-react";

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
    description: "One of the world's most photographed sunsets with breathtaking views over the Aegean Sea. A must-visit destination saved by millions of travelers.",
    globalSaves: 2847,
    hours: "Open 24/7",
    website: "www.santorini-tourism.com",
    phone: "+30 22860 22722",
    lat: 36.3932,
    lng: 25.4615
  },
  {
    id: "kyoto-bamboo-grove", 
    name: "Kyoto Bamboo Grove",
    location: "Kyoto, Japan",
    rating: 4.8,
    image: "🎋",
    category: "Parks",
    description: "Walk through thousands of towering bamboo stalks creating a natural cathedral. One of Japan's most serene and popular destinations.",
    globalSaves: 3156,
    hours: "6:00 AM - 6:00 PM",
    website: "www.kyoto-bamboo.jp",
    phone: "+81 75-211-1215",
    lat: 35.0170,
    lng: 135.6728
  },
  {
    id: "machu-picchu",
    name: "Machu Picchu",
    location: "Cusco, Peru", 
    rating: 4.9,
    image: "🏔️",
    category: "Tourist Attractions",
    description: "Ancient Incan citadel set high in the Andes Mountains. A UNESCO World Heritage site and one of the New Seven Wonders of the World.",
    globalSaves: 4203,
    hours: "6:00 AM - 5:30 PM",
    website: "www.machupicchu.gob.pe",
    phone: "+51 84 211030",
    lat: -13.1631,
    lng: -72.5450
  },
  {
    id: "cafe-central-vienna",
    name: "Café Central",
    location: "Vienna, Austria",
    rating: 4.7,
    image: "☕",
    category: "Cafes",
    description: "Historic Viennese coffeehouse with traditional atmosphere and exceptional pastries. A cultural landmark loved by coffee enthusiasts worldwide.",
    globalSaves: 1892,
    hours: "7:30 AM - 10:00 PM",
    website: "www.cafecentral.wien",
    phone: "+43 1 533 37 64",
    lat: 48.2108,
    lng: 16.3660
  },
  {
    id: "northern-lights-lodge-tromso",
    name: "Northern Lights Lodge",
    location: "Tromsø, Norway",
    rating: 4.8,
    image: "🌌",
    category: "Hotels",
    description: "Experience the magical Aurora Borealis from cozy glass igloos. Perfect location for Northern Lights viewing with luxury amenities.",
    globalSaves: 2134,
    hours: "Check-in: 3:00 PM",
    website: "www.northernlightslodge.no",
    phone: "+47 77 75 50 00",
    lat: 69.6496,
    lng: 18.9560
  }
];

const HomePopularPlace = ({ onPlaceClick }: HomePopularPlaceProps) => {
  const [currentPlace, setCurrentPlace] = useState<PopularPlace>(popularPlaces[0]);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds

  // Function to get a random place
  const getRandomPlace = () => {
    const randomIndex = Math.floor(Math.random() * popularPlaces.length);
    return popularPlaces[randomIndex];
  };

  // Initialize with random place and set up rotation
  useEffect(() => {
    setCurrentPlace(getRandomPlace());
    
    const interval = setInterval(() => {
      setCurrentPlace(getRandomPlace());
      setTimeRemaining(300); // Reset timer
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
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
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    setCurrentPlace(getRandomPlace());
    setTimeRemaining(300);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-orange-500" size={20} />
          <h3 className="text-xl font-semibold text-gray-800">Popular Place Globally</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Next: {formatTime(timeRemaining)}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            className="text-purple-600 h-8"
          >
            Refresh
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
                  <h4 className="font-bold text-base text-gray-800 mb-1">{currentPlace.name}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-600">{currentPlace.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-medium">{currentPlace.rating}</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {currentPlace.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">
                    {currentPlace.globalSaves.toLocaleString()} saves
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
