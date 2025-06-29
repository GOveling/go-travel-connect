
import { useState } from "react";
import { PlacePrediction } from "@/hooks/useGooglePlaces";
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
}

const ExploreSection = () => {
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setLoading(true);
    
    try {
      // Simulate API call - In real implementation, this would call Google Places API
      // with the selected categories as filters
      const mockResults: Place[] = [
        {
          id: '1',
          name: `${query} - Central Plaza`,
          address: `123 Main Street, ${query}`,
          coordinates: { lat: 40.7128, lng: -74.0060 },
          rating: 4.5,
          category: selectedCategories[0] || 'attraction',
          description: `Beautiful central plaza in ${query}`,
          hours: "Open 24 hours",
          priceLevel: 2
        },
        {
          id: '2',
          name: `${query} - Historic District`,
          address: `456 Historic Ave, ${query}`,
          coordinates: { lat: 40.7589, lng: -73.9851 },
          rating: 4.2,
          category: selectedCategories[0] || 'attraction',
          description: `Historic area with amazing architecture`,
          hours: "9:00 AM - 6:00 PM",
          priceLevel: 1
        }
      ];

      // Filter by selected categories if any
      const filteredResults = selectedCategories.length > 0 
        ? mockResults.filter(place => selectedCategories.includes(place.category))
        : mockResults;

      setSearchResults(filteredResults);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search places. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place: PlacePrediction) => {
    console.log('Google Places selection:', place);
    
    // Convert Google Places result to our Place format
    const selectedPlace = {
      name: place.structured_formatting.main_text,
      location: place.structured_formatting.secondary_text,
      description: place.description,
      rating: 4.5,
      image: "📍",
      category: "attraction",
      hours: "Hours vary",
      website: "",
      phone: "",
      lat: 0,
      lng: 0
    };

    setSelectedPlace(selectedPlace);
    setIsModalOpen(true);

    toast({
      title: "Place Selected",
      description: `Selected ${place.structured_formatting.main_text}`,
    });
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="p-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Explore Places</h1>
            <p className="text-sm text-gray-600">Discover amazing places around the world</p>
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
            onPlaceSelect={handlePlaceSelect}
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
