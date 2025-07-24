import React, { useState } from "react";
import { Search, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useGooglePlacesEnhanced,
  EnhancedPlace,
} from "@/hooks/useGooglePlacesEnhanced";

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
  business_status?: string;
  photos?: string[];
  reviews_count?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

interface ExploreSearchBarProps {
  onPlaceSelect?: (place: any) => void;
  onSearchSubmit?: (query: string) => void;
  onShowRelatedPlaces?: (place: any) => void;
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
  selectedCategories,
}: ExploreSearchBarProps) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const { predictions, loading, searchPlaces, clearResults } =
    useGooglePlacesEnhanced();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const convertEnhancedResultsToPlaces = (
    predictions: EnhancedPlace[]
  ): Place[] => {
    return predictions.map((prediction) => ({
      id: prediction.id,
      name: prediction.name,
      address: prediction.address,
      coordinates: prediction.coordinates,
      rating: prediction.rating,
      category: prediction.category,
      description: prediction.description,
      hours: prediction.hours,
      phone: prediction.phone,
      website: prediction.website,
      priceLevel: prediction.priceLevel,
      confidence_score: prediction.confidence_score,
      geocoded: prediction.geocoded,
      business_status: prediction.business_status,
      photos: prediction.photos,
      reviews_count: prediction.reviews_count,
      opening_hours: prediction.opening_hours,
      image: prediction.photos?.[0], // Use first photo as image
    }));
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      // Notify parent component that we're starting a search
      onLoadingChange?.(true);
      onSearchSubmit?.(searchQuery);

      try {
        // Start the enhanced search
        await searchPlaces(searchQuery, selectedCategories);

        // The search results will be handled by the useEffect below
      } catch (error) {
        console.error("Error during enhanced search:", error);
        onLoadingChange?.(false);
      }
    }
  };

  // Handle search results when predictions change
  React.useEffect(() => {
    if (predictions.length > 0) {
      const places = convertEnhancedResultsToPlaces(predictions);
      onSearchResults?.(places);
      onLoadingChange?.(false);
    }
  }, [predictions, onSearchResults, onLoadingChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getCategoryHint = () => {
    if (selectedCategories.length === 0)
      return "Buscar lugares con Google Places API - Datos precisos y verificados...";
    if (selectedCategories.length === 1) {
      const categoryNames: { [key: string]: string } = {
        restaurant: "restaurantes",
        hotel: "hoteles",
        attraction: "atracciones",
        shopping: "centros comerciales",
        entertainment: "lugares de entretenimiento",
        transport: "estaciones de transporte",
        health: "centros de salud",
        education: "instituciones educativas",
        landmark: "puntos de referencia",
        museum: "museos",
        park: "parques",
        beach: "playas",
        lake: "lagos",
      };
      return `Buscar ${categoryNames[selectedCategories[0]] || "lugares"} con datos verificados de Google...`;
    }
    return `Buscar en ${selectedCategories.length} categorías con Google Places API...`;
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
