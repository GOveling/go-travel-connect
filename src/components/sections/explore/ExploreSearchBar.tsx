
import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { predictions, loading, searchPlaces, clearResults } = useGeminiPlaces();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
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

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      // Notify parent component that we're starting a search
      onLoadingChange?.(true);
      onSearchSubmit?.(searchQuery);
      
      try {
        // Start the search with Gemini
        await searchPlaces(searchQuery, selectedCategories);
        
        // The search results will be handled by the useEffect below
      } catch (error) {
        console.error('Error during search:', error);
        onLoadingChange?.(false);
      }
    }
  };

  // Handle search results when predictions change
  React.useEffect(() => {
    if (predictions.length > 0) {
      const places = convertGeminiResultsToPlaces(predictions);
      onSearchResults?.(places);
      onLoadingChange?.(false);
    }
  }, [predictions, onSearchResults, onLoadingChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
    </div>
  );
};

export default ExploreSearchBar;
