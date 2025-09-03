import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EnhancedPlace,
  useGooglePlacesEnhanced,
} from "@/hooks/useGooglePlacesEnhanced";
import { useLanguage } from "@/hooks/useLanguage";
import { Loader2, Search } from "lucide-react";
import React, { useState } from "react";

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
  userLocation?: { lat: number; lng: number } | null;
  isNearbyEnabled?: boolean;
}

const ExploreSearchBar = ({
  onPlaceSelect,
  onSearchSubmit,
  onShowRelatedPlaces,
  onSearchResults,
  onLoadingChange,
  selectedCategories,
  userLocation,
  isNearbyEnabled = false,
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
    const valid = predictions.filter(
      (p) =>
        p &&
        p.coordinates &&
        Number.isFinite(p.coordinates.lat) &&
        Number.isFinite(p.coordinates.lng) &&
        // Exclude invalid coordinates (0,0) or very close to (0,0)
        (Math.abs(p.coordinates.lat) > 0.001 || Math.abs(p.coordinates.lng) > 0.001) &&
        // Exclude obviously invalid coordinates
        Math.abs(p.coordinates.lat) <= 90 &&
        Math.abs(p.coordinates.lng) <= 180
    );
    return valid.map((prediction) => ({
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
        // Start the enhanced search with location if nearby is enabled
        await searchPlaces(
          searchQuery, 
          selectedCategories, 
          isNearbyEnabled && userLocation ? userLocation : undefined
        );

        // The search results will be handled by the useEffect below
      } catch (error) {
        console.error("Error during enhanced search:", error);
        onLoadingChange?.(false);
      }
    }
  };

  // Handle search results when predictions change
  React.useEffect(() => {
    const places = convertEnhancedResultsToPlaces(predictions);
    onSearchResults?.(places);
    onLoadingChange?.(false);
  }, [predictions, onSearchResults, onLoadingChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getCategoryHint = () => {
    if (selectedCategories.length === 0) {
      return t("explore.searchPlaceholder");
    }
    if (selectedCategories.length === 1) {
      const categoryName = t(`explore.categories.${selectedCategories[0]}`);
      return `${t("explore.searchPlaceholder")} en ${categoryName}...`;
    }
    return `${t("explore.searchPlaceholder")} en ${selectedCategories.length} categorías...`;
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
