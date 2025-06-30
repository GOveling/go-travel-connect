
import { useState } from "react";
import { GeminiPlacePrediction } from "@/hooks/useGeminiPlaces";
import { useToast } from "@/hooks/use-toast";
import PlaceDetailModal from "@/components/modals/PlaceDetailModal";
import ExploreFilters from "./explore/ExploreFilters";
import ExploreSearchBar from "./explore/ExploreSearchBar";
import ExploreResults from "./explore/ExploreResults";

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

const ExploreSection = () => {
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  const handleSearchSubmit = async (query: string) => {
    setSearchQuery(query);
    setSelectedPlaceId(null);
    // Clear search results when doing a new search
    setSearchResults([]);
    // Note: The actual search will be handled by the search bar component
  };

  const handleShowRelatedPlaces = async (place: GeminiPlacePrediction) => {
    console.log('Showing places based on Gemini results for:', place);
    setLoading(true);
    setSelectedPlaceId(place.place_id);
    
    try {
      // Convert ALL Gemini predictions to Place format
      // This should be called with all the predictions from the search
      // For now, we'll create a placeholder that should be replaced with actual Gemini search results
      const convertedPlace: Place = {
        id: place.place_id,
        name: place.structured_formatting.main_text,
        address: place.full_address,
        coordinates: place.coordinates,
        rating: place.confidence_score >= 90 ? 4.5 : 4.0,
        category: place.types[0]?.replace(/_/g, ' ') || 'attraction',
        description: place.place_description || `${place.structured_formatting.main_text} in ${place.structured_formatting.secondary_text}`,
        hours: "Hours vary",
        phone: place.phone,
        priceLevel: 2,
        confidence_score: place.confidence_score,
        geocoded: place.geocoded
      };

      // Set the selected place first, others will come from the actual search results
      setSearchResults([convertedPlace]);
      setSearchQuery(`Places related to ${place.structured_formatting.main_text}`);

      toast({
        title: "Place Selected",
        description: `Showing details for ${place.structured_formatting.main_text}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to show place details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceClick = (place: Place) => {
    // Convert to legacy format for modal compatibility
    const legacyPlace = {
      name: place.name,
      location: place.address,
      description: place.description || `${place.category} in ${place.address}`,
      rating: place.rating || 4.0,
      image: place.image || "📍",
      category: place.category,
      hours: place.hours || "Hours vary",
      website: place.website || "",
      phone: place.phone || "",
      lat: place.coordinates.lat,
      lng: place.coordinates.lng
    };

    setSelectedPlace(legacyPlace);
    setIsModalOpen(true);
  };

  // Function to handle results from the search bar
  const handleSearchResults = (results: Place[], selectedId?: string) => {
    if (selectedId) {
      // Reorder results to put selected place first
      const selectedPlace = results.find(place => place.id === selectedId);
      const otherPlaces = results.filter(place => place.id !== selectedId);
      setSearchResults(selectedPlace ? [selectedPlace, ...otherPlaces] : results);
      setSelectedPlaceId(selectedId);
    } else {
      setSearchResults(results);
      setSelectedPlaceId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="p-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Explore Places</h1>
            <p className="text-sm text-gray-600">Discover amazing places around the world with AI-powered search</p>
          </div>

          {/* Filters */}
          <div className="mb-4">
            <ExploreFilters
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Search Bar */}
          <ExploreSearchBar
            selectedCategories={selectedCategories}
            onSearchSubmit={handleSearchSubmit}
            onShowRelatedPlaces={handleShowRelatedPlaces}
            onSearchResults={handleSearchResults}
          />
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        <ExploreResults
          places={searchResults}
          loading={loading}
          onPlaceClick={handlePlaceClick}
          searchQuery={searchQuery}
          selectedPlaceId={selectedPlaceId}
        />
      </div>

      {/* Place Detail Modal */}
      <PlaceDetailModal 
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToTrip={() => {}}
      />
    </div>
  );
};

export default ExploreSection;
