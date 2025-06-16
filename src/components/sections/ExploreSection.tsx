
import { useState } from "react";
import PlaceDetailModal from "@/components/modals/PlaceDetailModal";
import ExploreAddToTripModal from "@/components/modals/ExploreAddToTripModal";
import { useHomeState } from "@/hooks/useHomeState";
import { useToast } from "@/hooks/use-toast";
import ExploreHeader from "./explore/ExploreHeader";
import ExploreSearchBar from "./explore/ExploreSearchBar";
import ExploreTabsContent from "./explore/ExploreTabsContent";
import { allPlaces, categories } from "./explore/exploreData";

const ExploreSection = () => {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get actual trips from shared state
  const { trips, addPlaceToTrip, setTrips } = useHomeState();
  const { toast } = useToast();

  // Filter places based on selected category
  const filteredPlaces = selectedCategory === "All" 
    ? allPlaces.slice(0, 4) // Show first 4 for "All" category
    : allPlaces.filter(place => place.category === selectedCategory);

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

  return (
    <div className="min-h-screen p-4 space-y-6">
      <ExploreHeader />
      <ExploreSearchBar />
      
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
    </div>
  );
};

export default ExploreSection;
