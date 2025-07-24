import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Navigation,
  Heart,
  Camera,
  Users,
} from "lucide-react";
import ExploreSearchLoader from "./ExploreSearchLoader";

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
  geocoded?: boolean;
  confidence_score?: number;
  business_status?: string;
  photos?: string[];
  reviews_count?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

interface ExploreResultsProps {
  places: Place[];
  loading: boolean;
  onPlaceClick: (place: Place) => void;
  onShowLocation: (place: Place) => void;
  searchQuery?: string;
  selectedPlaceId?: string | null;
}

const ExploreResults = ({
  places,
  loading,
  onPlaceClick,
  onShowLocation,
  searchQuery,
  selectedPlaceId,
}: ExploreResultsProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId]
    );
  };

  const getPriceLevel = (level?: number) => {
    if (!level) return "";
    return "$".repeat(level);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      restaurant: "bg-red-100 text-red-800",
      hotel: "bg-blue-100 text-blue-800",
      attraction: "bg-purple-100 text-purple-800",
      shopping: "bg-green-100 text-green-800",
      entertainment: "bg-yellow-100 text-yellow-800",
      transport: "bg-indigo-100 text-indigo-800",
      health: "bg-pink-100 text-pink-800",
      education: "bg-cyan-100 text-cyan-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;

    if (confidence >= 90) {
      return (
        <Badge className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200">
          Google Verified
        </Badge>
      );
    }
    return (
      <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
        AI Generated
      </Badge>
    );
  };

  const getBusinessStatus = (status?: string, openingHours?: any) => {
    if (status === "OPERATIONAL" && openingHours?.open_now) {
      return (
        <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
          Open Now
        </Badge>
      );
    }
    if (status === "CLOSED_PERMANENTLY") {
      return (
        <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
          Permanently Closed
        </Badge>
      );
    }
    return null;
  };

  const isSelectedPlace = (placeId: string) => {
    return selectedPlaceId === placeId;
  };

  if (loading) {
    return <ExploreSearchLoader />;
  }

  if (places.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No se encontraron lugares
        </h3>
        <p className="text-gray-600">
          Intenta ajustar tu búsqueda o categorías
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Counter */}
      {places.length > 0 && (
        <div className="flex items-center justify-between py-2 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700">
              {places.length} resultados encontrados
            </span>
          </div>
        </div>
      )}

      {places.map((place) => (
        <Card
          key={place.id}
          className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm ${
            isSelectedPlace(place.id)
              ? "ring-2 ring-sky-500 bg-sky-50 shadow-lg"
              : ""
          }`}
          onClick={() => onPlaceClick(place)}
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Place Image/Icon */}
              <div
                className={`w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden ${
                  isSelectedPlace(place.id)
                    ? "bg-gradient-to-br from-sky-200 to-blue-200"
                    : "bg-gradient-to-br from-purple-100 to-orange-100"
                }`}
              >
                {place.image || (place.photos && place.photos[0]) ? (
                  <img
                    src={place.image || place.photos?.[0]}
                    alt={place.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-2xl">📍</span>
                )}
              </div>

              {/* Place Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className={`font-semibold text-sm leading-tight ${
                      isSelectedPlace(place.id)
                        ? "text-sky-900"
                        : "text-gray-900"
                    }`}
                  >
                    {place.name}
                    {isSelectedPlace(place.id) && (
                      <Badge className="ml-2 text-xs bg-sky-600 text-white">
                        Seleccionado
                      </Badge>
                    )}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => toggleFavorite(place.id, e)}
                    className="p-1 h-auto"
                  >
                    <Heart
                      size={16}
                      className={
                        favorites.includes(place.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }
                    />
                  </Button>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <MapPin size={12} />
                  <span className="truncate">{place.address}</span>
                </div>

                <div className="text-xs text-gray-400 mb-2 font-mono">
                  {place.coordinates.lat.toFixed(6)},{" "}
                  {place.coordinates.lng.toFixed(6)}
                  {place.geocoded === false && (
                    <span className="text-yellow-600 ml-2">
                      (Sin coordenadas)
                    </span>
                  )}
                </div>

                {/* Enhanced Info Section */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {place.rating && (
                      <div className="flex items-center gap-1">
                        <Star
                          size={12}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        <span className="text-xs font-medium">
                          {place.rating}
                        </span>
                        {place.reviews_count && (
                          <span className="text-xs text-gray-500">
                            ({place.reviews_count})
                          </span>
                        )}
                      </div>
                    )}

                    <Badge
                      className={`text-xs px-2 py-1 ${getCategoryColor(place.category)}`}
                    >
                      {place.category}
                    </Badge>

                    {getConfidenceBadge(place.confidence_score)}
                    {getBusinessStatus(
                      place.business_status,
                      place.opening_hours
                    )}

                    {place.priceLevel && (
                      <span className="text-xs text-green-600 font-semibold">
                        {getPriceLevel(place.priceLevel)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional Info Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {place.opening_hours?.open_now && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Clock size={10} />
                        <span>Abierto</span>
                      </div>
                    )}

                    {place.phone && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Phone size={10} />
                        <span>Tel</span>
                      </div>
                    )}

                    {place.website && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Globe size={10} />
                        <span>Web</span>
                      </div>
                    )}

                    {place.photos && place.photos.length > 1 && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Camera size={10} />
                        <span>{place.photos.length}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 h-auto ${
                      isSelectedPlace(place.id)
                        ? "text-sky-600 hover:text-sky-700"
                        : "text-purple-600 hover:text-purple-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowLocation(place);
                    }}
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
