
import { useState } from "react";
import PlaceDetailModal from "@/components/modals/PlaceDetailModal";
import ExploreAddToTripModal from "@/components/modals/ExploreAddToTripModal";
import ExploreFilterModal, { FilterOptions } from "@/components/modals/ExploreFilterModal";
import { useHomeState } from "@/hooks/useHomeState";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { PlacePrediction } from "@/hooks/useGooglePlaces";
import ExploreHeader from "./explore/ExploreHeader";
import ExploreSearchBar from "./explore/ExploreSearchBar";
import ExploreTabsContent from "./explore/ExploreTabsContent";
import { places, categories } from "./explore/exploreData";

const ExploreSection = () => {
  const { t } = useLanguage();
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    categories: ["All"],
    rating: null,
    priceRange: [],
    location: [],
    openNow: false
  });

  // Get actual trips from shared state
  const { trips, addPlaceToTrip, setTrips } = useHomeState();
  const { toast } = useToast();

  // Filter places based on selected category, active filters, and search query
  const getFilteredPlaces = () => {
    let filtered = selectedCategory === "All" 
      ? places.slice(0, 4) 
      : places.filter(place => place.category === selectedCategory);

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(place => 
        place.name.toLowerCase().includes(query) ||
        place.location.toLowerCase().includes(query) ||
        place.description.toLowerCase().includes(query)
      );
    }

    // Apply additional filters if not using "All" categories
    if (!activeFilters.categories.includes("All") && activeFilters.categories.length > 0) {
      filtered = filtered.filter(place => activeFilters.categories.includes(place.category));
    }

    if (activeFilters.rating) {
      filtered = filtered.filter(place => place.rating >= activeFilters.rating!);
    }

    return filtered;
  };

  const filteredPlaces = getFilteredPlaces();

  const handlePlaceClick = (place: any) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  const handleAddToTrip = () => {
    setIsModalOpen(false);
    setIsAddToTripModalOpen(true);
  };

  const handleAddToExistingTrip = (tripId: number, place: any) => {
    addPlaceToTrip(tripId, place);
    const selectedTrip = trips.find(trip => trip.id === tripId);
    
    toast({
      title: t("explore.addToTrip"),
      description: `${place.name} has been saved to ${selectedTrip?.name}`,
    });
    
    setIsAddToTripModalOpen(false);
    setSelectedPlace(null);
  };

  const handleCreateNewTrip = (tripData: any) => {
    setTrips(prev => [...prev, tripData]);
    setIsAddToTripModalOpen(false);
    setSelectedPlace(null);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    
    // Update category if filters specify specific categories
    if (!filters.categories.includes("All") && filters.categories.length > 0) {
      setSelectedCategory(filters.categories[0]);
    } else {
      setSelectedCategory("All");
    }

    toast({
      title: t("filters.apply"),
      description: "Search results updated based on your preferences",
    });
  };

  const handlePlaceSelect = (place: PlacePrediction) => {
    console.log('Google Places selection:', place);
    
    // Create a place object compatible with our existing structure
    const selectedPlace = {
      name: place.structured_formatting.main_text,
      location: place.structured_formatting.secondary_text,
      description: place.description,
      rating: 4.5, // Default rating for Google Places results
      image: "📍",
      category: "attraction",
      hours: "Hours vary",
      website: "",
      phone: "",
      lat: 0, // Would need Place Details API to get coordinates
      lng: 0
    };

    setSelectedPlace(selectedPlace);
    setIsModalOpen(true);

    toast({
      title: "Place Selected",
      description: `Selected ${place.structured_formatting.main_text}`,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      <ExploreHeader />
      <ExploreSearchBar 
        onFilterClick={handleFilterClick}
        onPlaceSelect={handlePlaceSelect}
        onSearchChange={handleSearchChange}
      />
      
      <ExploreTabsContent 
        categories={categories}
        selectedCategory={selectedCategory}
        filteredPlaces={filteredPlaces}
        onCategoryClick={handleCategoryClick}
        onPlaceClick={handlePlaceClick}
      />

      <PlaceDetailModal 
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToTrip={handleAddToTrip}
      />

      <ExploreAddToTripModal
        isOpen={isAddToTripModalOpen}
        onClose={() => setIsAddToTripModalOpen(false)}
        selectedPlace={selectedPlace}
        existingTrips={trips.filter(trip => trip.status !== 'completed')}
        onAddToExistingTrip={handleAddToExistingTrip}
        onCreateNewTrip={handleCreateNewTrip}
      />

      <ExploreFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </div>
  );
};

export default ExploreSection;
