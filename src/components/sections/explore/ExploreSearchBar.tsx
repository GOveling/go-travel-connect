
import { useState } from "react";
import { Search, Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useGooglePlaces, PlacePrediction } from "@/hooks/useGooglePlaces";

interface ExploreSearchBarProps {
  onPlaceSelect?: (place: PlacePrediction) => void;
  onSearchSubmit?: (query: string) => void;
  onShowRelatedPlaces?: (place: PlacePrediction) => void;
  selectedCategories: string[];
}

const ExploreSearchBar = ({ onPlaceSelect, onSearchSubmit, onShowRelatedPlaces, selectedCategories }: ExploreSearchBarProps) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { predictions, loading, searchPlaces, clearResults } = useGooglePlaces();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length > 2) {
      searchPlaces(value);
      setShowResults(true);
    } else {
      clearResults();
      setShowResults(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearchSubmit?.(searchQuery);
      setShowResults(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePlaceSelect = (place: PlacePrediction) => {
    setSearchQuery(place.description);
    setShowResults(false);
    clearResults();
    
    // En lugar de abrir el modal, mostramos lugares relacionados
    onShowRelatedPlaces?.(place);
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
              Found {predictions.length} places
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
                  <div className="text-xs text-gray-500 mb-1">
                    {place.structured_formatting.secondary_text}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Navigation size={12} />
                      <span>Show related places</span>
                    </div>
                    {place.types.length > 0 && (
                      <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {place.types[0].replace(/_/g, ' ')}
                      </div>
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
