import { useState } from "react";
import { Search, Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGeminiPlaces, GeminiPlacePrediction } from "@/hooks/useGeminiPlaces";

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
  confidence_score?: number;
  geocoded?: boolean;
}

interface ExploreSearchBarProps {
  onPlaceSelect?: (place: GeminiPlacePrediction) => void;
  onSearchSubmit?: (query: string) => void;
  onShowRelatedPlaces?: (place: GeminiPlacePrediction) => void;
  onSearchResults?: (results: Place[], selectedId?: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  selectedCategories: string[];
}

const ExploreSearchBar = ({ 
  onPlaceSelect, 
  onSearchSubmit, 
  onShowRelatedPlaces, 
  onSearchResults,
  onLoadingChange,
  selectedCategories 
}: ExploreSearchBarProps) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { predictions, loading, searchPlaces, clearResults } = useGeminiPlaces();

  // Debounce with 600ms delay
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    if (value.trim().length > 2) {
      // Set new timer with 600ms delay
      const newTimer = setTimeout(() => {
        searchPlaces(value, selectedCategories);
        setShowResults(true);
      }, 600);
      setDebounceTimer(newTimer);
    } else {
      clearResults();
      setShowResults(false);
    }
  };

  const convertGeminiResultsToPlaces = (predictions: GeminiPlacePrediction[]): Place[] => {
    return predictions.map(prediction => ({
      id: prediction.place_id,
      name: prediction.structured_formatting.main_text,
      address: prediction.full_address,
      coordinates: prediction.coordinates,
      rating: prediction.confidence_score >= 90 ? 4.5 : 4.0,
      category: prediction.types[0]?.replace(/_/g, ' ') || 'attraction',
      description: prediction.place_description || `${prediction.structured_formatting.main_text} in ${prediction.structured_formatting.secondary_text}`,
      hours: "Hours vary",
      phone: prediction.phone,
      priceLevel: 2,
      confidence_score: prediction.confidence_score,
      geocoded: prediction.geocoded
    }));
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Notify parent component that we're starting a search
      onLoadingChange?.(true);
      onSearchSubmit?.(searchQuery);
      
      // Convert all current predictions to places and show them
      if (predictions.length > 0) {
        const places = convertGeminiResultsToPlaces(predictions);
        onSearchResults?.(places);
        onLoadingChange?.(false);
      } else {
        // If no predictions yet, start a search
        searchPlaces(searchQuery, selectedCategories);
      }
      
      setShowResults(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePlaceSelect = (place: GeminiPlacePrediction) => {
    setSearchQuery(place.description);
    setShowResults(false);
    
    // Notify parent that we're processing selection
    onLoadingChange?.(true);
    
    // Convert all predictions to places and highlight the selected one
    const allPlaces = convertGeminiResultsToPlaces(predictions);
    onSearchResults?.(allPlaces, place.place_id);
    
    clearResults();
    onShowRelatedPlaces?.(place);
    
    // Loading will be handled by parent when results are processed
    setTimeout(() => onLoadingChange?.(false), 500);
  };

  const getCategoryHint = () => {
    if (selectedCategories.length === 0) return "Search anywhere...";
    if (selectedCategories.length === 1) {
      const categoryNames: { [key: string]: string } = {
        restaurant: "restaurants",
        hotel: "hotels",
        attraction: "attractions",
        shopping: "shopping centers",
        entertainment: "entertainment venues",
        transport: "transport hubs",
        health: "health facilities",
        education: "educational institutions"
      };
      return `Search ${categoryNames[selectedCategories[0]] || "places"}...`;
    }
    return `Search in ${selectedCategories.length} categories...`;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return (
        <Badge className="text-xs bg-sky-100 text-sky-800 border-sky-200">
          High confidence
        </Badge>
      );
    }
    return (
      <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
        Medium confidence
      </Badge>
    );
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-3 z-10">
          <Search className="text-gray-400" size={20} />
        </div>
        <Input
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={getCategoryHint()}
          className="pl-12 pr-20 h-12 border-2 border-gray-200 focus:border-purple-500 rounded-xl text-base"
        />
        <Button
          onClick={handleSearch}
          disabled={!searchQuery.trim() || loading}
          className="absolute right-2 top-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 px-4 h-8 rounded-lg"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 mt-2 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
              Found {predictions.length} places {loading && "(searching...)"}
            </div>
            {predictions.map((place, index) => (
              <div
                key={place.place_id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                onClick={() => handlePlaceSelect(place)}
              >
                <div className="flex-shrink-0 mt-1">
                  <MapPin size={16} className="text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm mb-1 truncate">
                    {place.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {place.structured_formatting.secondary_text}
                  </div>
                  {place.place_description && (
                    <div className="text-xs text-gray-400 mb-2 line-clamp-2">
                      {place.place_description}
                    </div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Navigation size={12} />
                      <span>Select place</span>
                    </div>
                    {getConfidenceBadge(place.confidence_score)}
                    {!place.geocoded && (
                      <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                        No coordinates
                      </Badge>
                    )}
                    {place.types.length > 0 && (
                      <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                        {place.types[0].replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreSearchBar;
