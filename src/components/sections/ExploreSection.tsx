
import { useState } from "react";
import PlaceDetailModal from "@/components/modals/PlaceDetailModal";
import ExploreAddToTripModal from "@/components/modals/ExploreAddToTripModal";
import ExploreFilterModal, { FilterOptions } from "@/components/modals/ExploreFilterModal";
import { useHomeState } from "@/hooks/useHomeState";
import { useToast } from "@/hooks/use-toast";
import ExploreHeader from "./explore/ExploreHeader";
import ExploreSearchBar from "./explore/ExploreSearchBar";
import ExploreTabsContent from "./explore/ExploreTabsContent";
import { places, categories } from "./explore/exploreData";

const ExploreSection = () => {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
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

  // Filter places based on selected category and active filters
  const getFilteredPlaces = () => {
    let filtered = selectedCategory === "All" 
      ? places.slice(0, 4) 
      : places.filter(place => place.category === selectedCategory);

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
      title: "Place added to trip!",
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
      title: "Filters applied",
      description: "Search results updated based on your preferences",
    });
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      <ExploreHeader />
      <ExploreSearchBar onFilterClick={handleFilterClick} />
      
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
