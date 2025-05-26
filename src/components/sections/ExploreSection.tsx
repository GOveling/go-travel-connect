
import { Search, Star, MapPin, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ExploreSection = () => {
  const popularPlaces = [
    {
      name: "Eiffel Tower",
      location: "Paris, France",
      rating: 4.8,
      image: "🗼",
      category: "Landmark"
    },
    {
      name: "Colosseum",
      location: "Rome, Italy",
      rating: 4.7,
      image: "🏛️",
      category: "Historical"
    },
    {
      name: "Santorini",
      location: "Greece",
      rating: 4.9,
      image: "🌅",
      category: "Beach"
    },
    {
      name: "Tokyo Tower",
      location: "Tokyo, Japan",
      rating: 4.6,
      image: "🗼",
      category: "Landmark"
    }
  ];

  const categories = ["All", "Landmarks", "Museums", "Beaches", "Historical", "Nature"];

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="pt-8 pb-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Explore</h2>
        <p className="text-gray-600">Discover amazing places for your next adventure</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <Input
          placeholder="Search destinations, attractions..."
          className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500"
        />
        <Button size="sm" className="absolute right-2 top-2 bg-gradient-to-r from-blue-500 to-orange-500">
          <Filter size={16} />
        </Button>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category, index) => (
          <Button
            key={category}
            variant={index === 0 ? "default" : "outline"}
            size="sm"
            className={`whitespace-nowrap ${
              index === 0
                ? "bg-gradient-to-r from-blue-500 to-orange-500"
                : "border-gray-300"
            }`}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Featured Destination */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-3xl">🏝️</span>
            <div>
              <h3 className="text-xl font-bold">Maldives</h3>
              <p className="text-sm opacity-90">Featured Destination</p>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-3">
            Paradise islands with crystal clear waters and overwater bungalows
          </p>
          <Button variant="secondary" size="sm">
            Explore Now
          </Button>
        </div>
      </Card>

      {/* Popular Places */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Popular Places</h3>
          <Button variant="ghost" size="sm" className="text-blue-600">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {popularPlaces.map((place, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center">
                  <span className="text-4xl">{place.image}</span>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm mb-1">{place.name}</h4>
                  <div className="flex items-center space-x-1 mb-2">
                    <MapPin size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-500">{place.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">{place.rating}</span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {place.category}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExploreSection;
