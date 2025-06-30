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
    console.log('Mostrando lugares basados en resultados de Gemini para:', place);
    setLoading(true);
    setSelectedPlaceId(place.place_id);
    
    try {
      toast({
        title: "Lugar Seleccionado",
        description: `Mostrando detalles para ${place.structured_formatting.main_text}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al mostrar detalles del lugar. Inténtalo de nuevo.",
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

  // Function to handle results from the search bar - ALWAYS render ALL results
  const handleSearchResults = (results: Place[], selectedId?: string) => {
    // ALWAYS show ALL results, just reorder if there's a selected place
    if (selectedId) {
      // Reorder results to put selected place first, but keep ALL results
      const selectedPlace = results.find(place => place.id === selectedId);
      const otherPlaces = results.filter(place => place.id !== selectedId);
      setSearchResults(selectedPlace ? [selectedPlace, ...otherPlaces] : results);
      setSelectedPlaceId(selectedId);
    } else {
      // Show all results without any filtering
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Explorar Lugares</h1>
            <p className="text-sm text-gray-600">Descubre lugares increíbles alrededor del mundo con búsqueda potenciada por IA</p>
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
