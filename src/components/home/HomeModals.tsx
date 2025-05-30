
import NotificationAlertsModal from "@/components/modals/NotificationAlertsModal";
import AddMemoryModal from "@/components/modals/AddMemoryModal";
import InstaTripModal from "@/components/modals/InstaTripModal";
import ProfilePublicationModal from "@/components/modals/ProfilePublicationModal";
import NewTripModal from "@/components/modals/NewTripModal";
import AddToTripModal from "@/components/modals/AddToTripModal";
import TripDetailModal from "@/components/modals/TripDetailModal";
import PhotobookModal from "@/components/modals/PhotobookModal";
import LoginModal from "@/components/modals/LoginModal";
import SignUpModal from "@/components/modals/SignUpModal";
import { useHomeState } from "@/hooks/useHomeState";
import { useHomeHandlers } from "@/hooks/useHomeHandlers";

interface HomeModalsProps {
  homeState: ReturnType<typeof useHomeState>;
  handlers: ReturnType<typeof useHomeHandlers>;
}

const HomeModals = ({ homeState, handlers }: HomeModalsProps) => {
  const handleSwitchToSignUp = () => {
    homeState.setIsLoginModalOpen && homeState.setIsLoginModalOpen(false);
    homeState.setIsSignUpModalOpen && homeState.setIsSignUpModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    homeState.setIsSignUpModalOpen && homeState.setIsSignUpModalOpen(false);
    homeState.setIsLoginModalOpen && homeState.setIsLoginModalOpen(true);
  };

  return (
    <>
      <NotificationAlertsModal
        isOpen={homeState.isNotificationModalOpen}
        onClose={() => homeState.setIsNotificationModalOpen(false)}
        notificationCount={homeState.notificationCount}
        onMarkAllRead={handlers.handleMarkAllNotificationsRead}
      />

      <AddMemoryModal
        isOpen={homeState.isAddMemoryModalOpen}
        onClose={() => homeState.setIsAddMemoryModalOpen(false)}
        onAddInstaTripImage={handlers.handleAddInstaTripImage}
        onCreatePublication={handlers.handleCreatePublicationFromAddMemory}
        onOpenTripPhotobook={handlers.handleOpenTripPhotobook}
        trips={homeState.trips}
      />

      <InstaTripModal
        isOpen={homeState.isInstaTripModalOpen}
        onClose={() => homeState.setIsInstaTripModalOpen(false)}
        images={homeState.instaTripImages}
        onRemoveImage={handlers.handleRemoveInstaTripImage}
      />

      <ProfilePublicationModal
        isOpen={homeState.isProfilePublicationModalOpen}
        onClose={() => homeState.setIsProfilePublicationModalOpen(false)}
        onAddPublication={handlers.handleAddProfilePost}
      />

      <NewTripModal
        isOpen={homeState.isNewTripModalOpen}
        onClose={() => homeState.setIsNewTripModalOpen(false)}
        onCreateTrip={handlers.handleCreateTrip}
      />

      <AddToTripModal
        isOpen={homeState.isAddToTripModalOpen}
        onClose={() => {
          homeState.setIsAddToTripModalOpen(false);
          homeState.setSelectedPostForTrip(null);
        }}
        existingTrips={homeState.trips.filter(trip => trip.status !== 'completed')}
        onAddToExistingTrip={handlers.handleAddToExistingTrip}
        onCreateNewTrip={handlers.handleCreateNewTripFromPost}
        postLocation={homeState.selectedPostForTrip?.location}
      />

      <TripDetailModal
        isOpen={homeState.isTripDetailModalOpen}
        onClose={() => homeState.setIsTripDetailModalOpen(false)}
        trip={homeState.currentTrip}
      />

      <PhotobookModal
        trip={homeState.selectedTripForPhotobook}
        isOpen={homeState.isPhotobookModalOpen}
        onClose={() => {
          homeState.setIsPhotobookModalOpen(false);
          homeState.setSelectedTripForPhotobook(null);
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={homeState.isLoginModalOpen || false}
        onClose={() => homeState.setIsLoginModalOpen && homeState.setIsLoginModalOpen(false)}
        onLogin={(email, password) => {
          console.log("Email login:", email);
          // Handle email/password login here
        }}
        onGoogleLogin={() => {
          console.log("Google login");
          // Handle Google login here
        }}
        onSwitchToSignUp={handleSwitchToSignUp}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={homeState.isSignUpModalOpen || false}
        onClose={() => homeState.setIsSignUpModalOpen && homeState.setIsSignUpModalOpen(false)}
        onSignUp={(name, email, password) => {
          console.log("Email sign up:", name, email);
          // Handle email/password sign up here
        }}
        onGoogleSignUp={() => {
          console.log("Google sign up");
          // Handle Google sign up here
        }}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default HomeModals;
