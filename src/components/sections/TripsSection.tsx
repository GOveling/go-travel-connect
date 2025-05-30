
import { Plus, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import TripMap from "@/components/maps/TripMap";
import TripDetailModal from "@/components/modals/TripDetailModal";
import NewTripModal from "@/components/modals/NewTripModal";
import InviteFriendsModal from "@/components/modals/InviteFriendsModal";
import GroupOptionsModal from "@/components/modals/GroupOptionsModal";
import AISmartRouteModal from "@/components/modals/AISmartRouteModal";
import BeachVacationModal from "@/components/modals/BeachVacationModal";
import MountainTripModal from "@/components/modals/MountainTripModal";
import CityBreakModal from "@/components/modals/CityBreakModal";
import BackpackingModal from "@/components/modals/BackpackingModal";
import EditTripModal from "@/components/modals/EditTripModal";
import { calculateTripStatus } from "@/utils/tripStatusUtils";
import TripCard from "@/components/trips/TripCard";
import QuickStats from "@/components/trips/QuickStats";
import TripTemplates from "@/components/trips/TripTemplates";
import ShareSection from "@/components/trips/ShareSection";

const TripsSection = () => {
  const [showMap, setShowMap] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetail, setShowTripDetail] = useState(false);
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [showInviteFriendsModal, setShowInviteFriendsModal] = useState(false);
  const [showGroupOptionsModal, setShowGroupOptionsModal] = useState(false);
  const [showAISmartRouteModal, setShowAISmartRouteModal] = useState(false);
  const [showBeachVacationModal, setShowBeachVacationModal] = useState(false);
  const [showMountainTripModal, setShowMountainTripModal] = useState(false);
  const [showCityBreakModal, setShowCityBreakModal] = useState(false);
  const [showBackpackingModal, setShowBackpackingModal] = useState(false);
  const [showEditTripModal, setShowEditTripModal] = useState(false);
  
  const [trips, setTrips] = useState([
    {
      id: 1,
      name: "European Adventure",
      destination: "Paris → Rome → Barcelona",
      dates: "Dec 15 - Dec 25, 2024",
      status: "upcoming",
      travelers: 3,
      image: "🇪🇺",
      isGroupTrip: true,
      collaborators: [
        { id: "1", name: "Alice Johnson", email: "alice@example.com", avatar: "AJ", role: "owner" as const },
        { id: "2", name: "Bob Smith", email: "bob@example.com", avatar: "BS", role: "editor" as const },
        { id: "3", name: "Carol Davis", email: "carol@example.com", avatar: "CD", role: "viewer" as const }
      ],
      coordinates: [
        { name: "Paris", lat: 48.8566, lng: 2.3522 },
        { name: "Rome", lat: 41.9028, lng: 12.4964 },
        { name: "Barcelona", lat: 41.3851, lng: 2.1734 }
      ],
      description: "A wonderful journey through Europe's most iconic cities, exploring rich history, amazing cuisine, and beautiful architecture.",
      budget: "$3,500 per person",
      accommodation: "Mix of boutique hotels and Airbnb",
      transportation: "Flights and high-speed trains"
    },
    {
      id: 2,
      name: "Tokyo Discovery",
      destination: "Tokyo, Japan",
      dates: "Jan 8 - Jan 15, 2025",
      status: "planning",
      travelers: 1,
      image: "🇯🇵",
      isGroupTrip: false,
      coordinates: [
        { name: "Tokyo", lat: 35.6762, lng: 139.6503 }
      ],
      description: "Immerse yourself in Japanese culture, from traditional temples to modern technology and incredible food experiences.",
      budget: "$2,800 per person",
      accommodation: "Traditional ryokan and modern hotels",
      transportation: "JR Pass and local trains"
    },
    {
      id: 3,
      name: "Bali Retreat",
      destination: "Bali, Indonesia",
      dates: "Nov 20 - Nov 27, 2024",
      status: "completed",
      travelers: 3,
      image: "🇮🇩",
      isGroupTrip: true,
      collaborators: [
        { id: "1", name: "You", email: "you@example.com", avatar: "YO", role: "owner" as const },
        { id: "4", name: "Emma Wilson", email: "emma@example.com", avatar: "EW", role: "editor" as const },
        { id: "5", name: "David Brown", email: "david@example.com", avatar: "DB", role: "editor" as const }
      ],
      coordinates: [
        { name: "Bali", lat: -8.3405, lng: 115.0920 }
      ],
      description: "A relaxing retreat in paradise with yoga sessions, beautiful beaches, and spiritual experiences in temples.",
      budget: "$1,800 per person",
      accommodation: "Beach resort and villas",
      transportation: "Private transfers and scooters"
    }
  ]);

  // Calculate automatic status for each trip
  const tripsWithAutoStatus = trips.map(trip => ({
    ...trip,
    status: calculateTripStatus(trip.dates)
  }));

  const handleViewDetails = (trip: any) => {
    setSelectedTrip(trip);
    setShowTripDetail(true);
  };

  const handleCreateTrip = (tripData: any) => {
    setTrips(prev => [...prev, tripData]);
  };

  const handleUpdateTrip = (updatedTrip: any) => {
    setTrips(prev => prev.map(trip => trip.id === updatedTrip.id ? updatedTrip : trip));
  };

  const handleDeleteTrip = (tripId: number) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
  };

  const handleEditTrip = (trip: any) => {
    setSelectedTrip(trip);
    setShowEditTripModal(true);
  };

  const handleInviteFriends = (trip: any) => {
    setSelectedTrip(trip);
    setShowInviteFriendsModal(true);
  };

  const handleGroupOptions = (trip: any) => {
    setSelectedTrip(trip);
    setShowGroupOptionsModal(true);
  };

  const handleAISmartRoute = (trip: any) => {
    setSelectedTrip(trip);
    setShowAISmartRouteModal(true);
  };

  const handleViewSavedPlaces = (trip: any) => {
    setSelectedTrip(trip);
    setShowTripDetail(true);
    // We'll use a custom event to tell the TripDetailModal to show the saved-places tab
    setTimeout(() => {
      const event = new CustomEvent('openSavedPlacesTab');
      window.dispatchEvent(event);
    }, 100);
  };

  if (showMap) {
    return (
      <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="pt-4 sm:pt-8 pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Trip Map</h2>
              <p className="text-gray-600 text-sm sm:text-base">View all your trip destinations</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowMap(false)}
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
            >
              Back to List
            </Button>
          </div>
        </div>

        {/* Map Component */}
        <TripMap trips={tripsWithAutoStatus} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="pt-4 sm:pt-8 pb-2 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">My Trips</h2>
            <p className="text-gray-600 text-sm sm:text-base">Plan and manage your adventures</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              variant="outline"
              onClick={() => setShowMap(true)}
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
            >
              <Map size={20} className="mr-2" />
              Map View
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-orange-500 border-0 w-full sm:w-auto"
              onClick={() => setShowNewTripModal(true)}
            >
              <Plus size={20} className="mr-2" />
              New Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats trips={tripsWithAutoStatus} />

      {/* Trips List */}
      <div className="space-y-4">
        {tripsWithAutoStatus.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onViewDetails={handleViewDetails}
            onEditTrip={handleEditTrip}
            onInviteFriends={handleInviteFriends}
            onGroupOptions={handleGroupOptions}
            onAISmartRoute={handleAISmartRoute}
            onViewSavedPlaces={handleViewSavedPlaces}
          />
        ))}
      </div>

      {/* Trip Templates */}
      <TripTemplates
        onBeachVacation={() => setShowBeachVacationModal(true)}
        onMountainTrip={() => setShowMountainTripModal(true)}
        onCityBreak={() => setShowCityBreakModal(true)}
        onBackpacking={() => setShowBackpackingModal(true)}
      />

      {/* Share App with Travelers Friends */}
      <ShareSection />

      {/* All Modals */}
      <NewTripModal 
        isOpen={showNewTripModal}
        onClose={() => setShowNewTripModal(false)}
        onCreateTrip={handleCreateTrip}
      />

      <TripDetailModal 
        trip={selectedTrip}
        isOpen={showTripDetail}
        onClose={() => {
          setShowTripDetail(false);
          setSelectedTrip(null);
        }}
      />

      <InviteFriendsModal
        trip={selectedTrip}
        isOpen={showInviteFriendsModal}
        onClose={() => {
          setShowInviteFriendsModal(false);
          setSelectedTrip(null);
        }}
      />

      <GroupOptionsModal
        trip={selectedTrip}
        isOpen={showGroupOptionsModal}
        onClose={() => {
          setShowGroupOptionsModal(false);
          setSelectedTrip(null);
        }}
      />

      <AISmartRouteModal
        trip={selectedTrip}
        isOpen={showAISmartRouteModal}
        onClose={() => {
          setShowAISmartRouteModal(false);
          setSelectedTrip(null);
        }}
      />

      <BeachVacationModal
        isOpen={showBeachVacationModal}
        onClose={() => setShowBeachVacationModal(false)}
        onCreateTrip={handleCreateTrip}
      />

      <MountainTripModal
        isOpen={showMountainTripModal}
        onClose={() => setShowMountainTripModal(false)}
        onCreateTrip={handleCreateTrip}
      />

      <CityBreakModal
        isOpen={showCityBreakModal}
        onClose={() => setShowCityBreakModal(false)}
        onCreateTrip={handleCreateTrip}
      />

      <BackpackingModal
        isOpen={showBackpackingModal}
        onClose={() => setShowBackpackingModal(false)}
        onCreateTrip={handleCreateTrip}
      />

      <EditTripModal
        trip={selectedTrip}
        isOpen={showEditTripModal}
        onClose={() => {
          setShowEditTripModal(false);
          setSelectedTrip(null);
        }}
        onUpdateTrip={handleUpdateTrip}
        onDeleteTrip={handleDeleteTrip}
      />
    </div>
  );
};

export default TripsSection;
