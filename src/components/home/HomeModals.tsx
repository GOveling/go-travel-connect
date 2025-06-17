
import NotificationAlertsModal from "@/components/modals/NotificationAlertsModal";
import NewTripModal from "@/components/modals/NewTripModal";
import TripDetailModal from "@/components/modals/TripDetailModal";
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

      <NewTripModal
        isOpen={homeState.isNewTripModalOpen}
        onClose={() => homeState.setIsNewTripModalOpen(false)}
        onCreateTrip={handlers.handleCreateTrip}
      />

      <TripDetailModal
        isOpen={homeState.isTripDetailModalOpen}
        onClose={() => homeState.setIsTripDetailModalOpen(false)}
        trip={homeState.currentTrip}
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
