
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

  const handleShowRelatedPlaces = async (place: PlacePrediction) => {
    console.log('Showing related places for:', place);
    setLoading(true);
    
    try {
      // Simulate API call to get related places
      const relatedPlaces: Place[] = [
        {
          id: 'related-1',
          name: `Near ${place.structured_formatting.main_text} - Restaurant`,
          address: `Close to ${place.structured_formatting.secondary_text}`,
          coordinates: { lat: 40.7128, lng: -74.0060 },
          rating: 4.3,
          category: 'restaurant',
          description: `Popular restaurant near ${place.structured_formatting.main_text}`,
          hours: "11:00 AM - 10:00 PM",
          priceLevel: 3
        },
        {
          id: 'related-2',
          name: `Near ${place.structured_formatting.main_text} - Hotel`,
          address: `Walking distance from ${place.structured_formatting.secondary_text}`,
          coordinates: { lat: 40.7589, lng: -73.9851 },
          rating: 4.7,
          category: 'hotel',
          description: `Comfortable hotel with great views`,
          hours: "24/7",
          priceLevel: 4
        },
        {
          id: 'related-3',
          name: `Near ${place.structured_formatting.main_text} - Attraction`,
          address: `Adjacent to ${place.structured_formatting.secondary_text}`,
          coordinates: { lat: 40.7300, lng: -74.0100 },
          rating: 4.1,
          category: 'attraction',
          description: `Must-see attraction in the area`,
          hours: "9:00 AM - 6:00 PM",
          priceLevel: 2
        }
      ];

      // Filter by selected categories if any
      const filteredResults = selectedCategories.length > 0 
        ? relatedPlaces.filter(relatedPlace => selectedCategories.includes(relatedPlace.category))
        : relatedPlaces;

      setSearchResults(filteredResults);
      setSearchQuery(`Related places near ${place.structured_formatting.main_text}`);

      toast({
        title: "Related Places Found",
        description: `Found ${filteredResults.length} places near ${place.structured_formatting.main_text}`,
      });
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to find related places. Please try again.",
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
            onShowRelatedPlaces={handleShowRelatedPlaces}
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
