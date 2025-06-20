
import { Plus, Map } from "lucide-react";
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
import ShareSection from "@/components/trips/ShareSection";
import { useHomeState } from "@/hooks/useHomeState";
import { useLanguage } from "@/contexts/LanguageContext";
import { IOSNavigationBar } from "@/components/ui/ios-navigation-bar";
import { IOSButton } from "@/components/ui/ios-button";
import IOSTripCard from "@/components/trips/IOSTripCard";
import IOSQuickStats from "@/components/trips/IOSQuickStats";
import IOSTripTemplates from "@/components/trips/IOSTripTemplates";

const TripsSection = () => {
  const { t } = useLanguage();
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
  
  const { trips, setTrips } = useHomeState();

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
    setTimeout(() => {
      const event = new CustomEvent('openSavedPlacesTab');
      window.dispatchEvent(event);
    }, 100);
  };

  if (showMap) {
    return (
      <div className="min-h-screen bg-gray-50">
        <IOSNavigationBar
          title="Trip Map"
          leftAction={{
            label: "Back",
            onClick: () => setShowMap(false)
          }}
        />
        <div className="p-4">
          <TripMap trips={tripsWithAutoStatus} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS Navigation Bar */}
      <IOSNavigationBar
        title="My Trips"
        rightAction={{
          icon: <Plus size={20} />,
          onClick: () => setShowNewTripModal(true)
        }}
      />

      {/* Main Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex space-x-3">
          <IOSButton
            variant="secondary"
            size="sm"
            className="flex-1 flex items-center justify-center space-x-2"
            onClick={() => setShowMap(true)}
          >
            <Map size={16} />
            <span>Map View</span>
          </IOSButton>
          <IOSButton
            variant="primary"
            size="sm"
            className="flex-1 flex items-center justify-center space-x-2"
            onClick={() => setShowNewTripModal(true)}
          >
            <Plus size={16} />
            <span>New Trip</span>
          </IOSButton>
        </div>

        {/* Quick Stats */}
        <IOSQuickStats trips={tripsWithAutoStatus} />

        {/* Trips List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 px-1">Your Trips</h2>
          {tripsWithAutoStatus.map((trip) => (
            <IOSTripCard
              key={trip.id}
              trip={trip}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* Trip Templates */}
        <IOSTripTemplates
          onBeachVacation={() => setShowBeachVacationModal(true)}
          onMountainTrip={() => setShowMountainTripModal(true)}
          onCityBreak={() => setShowCityBreakModal(true)}
          onBackpacking={() => setShowBackpackingModal(true)}
        />

        {/* Share Section */}
        <ShareSection />
      </div>

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
