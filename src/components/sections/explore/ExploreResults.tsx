
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Phone, Globe, Navigation, Heart } from "lucide-react";

interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  category: string;
  image?: string;
  description?: string;
  hours?: string;
  phone?: string;
  website?: string;
  priceLevel?: number;
}

interface ExploreResultsProps {
  places: Place[];
  loading: boolean;
  onPlaceClick: (place: Place) => void;
  searchQuery?: string;
}

const ExploreResults = ({ places, loading, onPlaceClick, searchQuery }: ExploreResultsProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(placeId) 
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    );
  };

  const getPriceLevel = (level?: number) => {
    if (!level) return '';
    return '$'.repeat(level);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      restaurant: 'bg-red-100 text-red-800',
      hotel: 'bg-blue-100 text-blue-800',
      attraction: 'bg-purple-100 text-purple-800',
      shopping: 'bg-green-100 text-green-800',
      entertainment: 'bg-yellow-100 text-yellow-800',
      transport: 'bg-indigo-100 text-indigo-800',
      health: 'bg-pink-100 text-pink-800',
      education: 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (places.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No places found</h3>
        <p className="text-gray-600">Try adjusting your search or categories</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchQuery && (
        <div className="text-sm text-gray-600 mb-4">
          Found {places.length} places for "{searchQuery}"
        </div>
      )}
      
      {places.map((place) => (
        <Card 
          key={place.id} 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm"
          onClick={() => onPlaceClick(place)}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Place Image/Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                {place.image ? (
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl">📍</span>
                )}
              </div>

              {/* Place Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {place.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => toggleFavorite(place.id, e)}
                    className="p-1 h-auto"
                  >
                    <Heart 
                      size={16} 
                      className={favorites.includes(place.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                    />
                  </Button>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <MapPin size={12} />
                  <span className="truncate">{place.address}</span>
                </div>

                <div className="text-xs text-gray-400 mb-2 font-mono">
                  {place.coordinates.lat.toFixed(6)}, {place.coordinates.lng.toFixed(6)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {place.rating && (
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{place.rating}</span>
                      </div>
                    )}
                    
                    <Badge className={`text-xs px-2 py-1 ${getCategoryColor(place.category)}`}>
                      {place.category}
                    </Badge>

                    {place.priceLevel && (
                      <span className="text-xs text-green-600 font-semibold">
                        {getPriceLevel(place.priceLevel)}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-600 hover:text-purple-700 p-1 h-auto"
                  >
                    <Navigation size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExploreResults;
