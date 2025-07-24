import { Plus, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import TripMapInteractive from "@/components/maps/TripMapInteractive";
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
import DeleteTripConfirmationModal from "@/components/modals/DeleteTripConfirmationModal";
import { calculateTripStatus } from "@/utils/tripStatusUtils";
import TripCard from "@/components/trips/TripCard";
import QuickStats from "@/components/trips/QuickStats";
import TripTemplates from "@/components/trips/TripTemplates";
import ShareSection from "@/components/trips/ShareSection";
import { useHomeState } from "@/hooks/useHomeState";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);

  // Use Supabase trips instead of local state
  const { trips, loading, createTrip, updateTrip, deleteTrip } = useHomeState();

  // Calculate automatic status for each trip
  const tripsWithAutoStatus = trips.map((trip) => ({
    ...trip,
    status: calculateTripStatus(trip.dates),
  }));

  const handleViewDetails = (trip: any) => {
    setSelectedTrip(trip);
    setShowTripDetail(true);
  };

  const handleCreateTrip = async (tripData: any) => {
    await createTrip(tripData);
  };

  const handleUpdateTrip = async (updatedTrip: any) => {
    await updateTrip(updatedTrip.id, updatedTrip);
  };

  const handleDeleteTrip = async (tripId: string | number) => {
    await deleteTrip(tripId);
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
    console.log("AI Smart Route button clicked for trip:", trip); // Debug log
    setSelectedTrip(trip);
    setShowAISmartRouteModal(true);
  };

  const handleUpdateTripData = (updatedTrip: any) => {
    // Update the selected trip with the new data
    setSelectedTrip(updatedTrip);
  };

  const handleViewSavedPlaces = (trip: any) => {
    setSelectedTrip(trip);
    setShowTripDetail(true);
    // We'll use a custom event to tell the TripDetailModal to show the saved-places tab
    setTimeout(() => {
      const event = new CustomEvent("openSavedPlacesTab");
      window.dispatchEvent(event);
    }, 100);
  };

  const handleDeleteTripRequest = (trip: any) => {
    setTripToDelete(trip);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (tripToDelete) {
      await deleteTrip(tripToDelete.id);
      setShowDeleteConfirmModal(false);
      setTripToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-6">
        <div className="pt-4 sm:pt-8 pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {t("trips.title")}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {t("trips.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (showMap) {
    return (
      <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="pt-4 sm:pt-8 pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {t("trips.mapView")}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                View all your trip destinations
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowMap(false)}
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
            >
              {t("trips.backToList")}
            </Button>
          </div>
        </div>

        {/* Map Component */}
        {typeof window !== "undefined" && (
          <TripMapInteractive trips={tripsWithAutoStatus} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="pt-4 sm:pt-8 pb-2 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {t("trips.title")}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {t("trips.subtitle")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowMap(true)}
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
            >
              <Map size={20} className="mr-2" />
              {t("trips.mapView")}
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-orange-500 border-0 w-full sm:w-auto"
              onClick={() => setShowNewTripModal(true)}
            >
              <Plus size={20} className="mr-2" />
              {t("trips.newTrip")}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats trips={tripsWithAutoStatus} />

      {/* Trips List */}
      <div className="space-y-4">
        {tripsWithAutoStatus.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No trips yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first trip to get started!
            </p>
            <Button
              className="bg-gradient-to-r from-blue-500 to-orange-500"
              onClick={() => setShowNewTripModal(true)}
            >
              <Plus size={20} className="mr-2" />
              Create Your First Trip
            </Button>
          </div>
        ) : (
          tripsWithAutoStatus.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onViewDetails={handleViewDetails}
              onEditTrip={handleEditTrip}
              onInviteFriends={handleInviteFriends}
              onGroupOptions={handleGroupOptions}
              onAISmartRoute={handleAISmartRoute}
              onViewSavedPlaces={handleViewSavedPlaces}
              onDeleteTrip={handleDeleteTripRequest}
            />
          ))
        )}
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
        onUpdateTrip={handleUpdateTripData}
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
        onDeleteTrip={handleDeleteTripRequest}
      />

      <DeleteTripConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => {
          setShowDeleteConfirmModal(false);
          setTripToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        tripName={tripToDelete?.name || ""}
      />
    </div>
  );
};

export default TripsSection;
