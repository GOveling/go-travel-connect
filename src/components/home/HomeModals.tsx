
import NotificationAlertsModal from "@/components/modals/NotificationAlertsModal";
import NewTripModal from "@/components/modals/NewTripModal";
import TripDetailModal from "@/components/modals/TripDetailModal";
import LoginModal from "@/components/modals/LoginModal";
import SignUpModal from "@/components/modals/SignUpModal";
import { useHomeState } from "@/hooks/useHomeState";
import { useHomeHandlers } from "@/hooks/useHomeHandlers";
import { useAuth } from "@/hooks/useAuth";
import { useReduxAuth } from "@/hooks/useReduxAuth";

interface HomeModalsProps {
  homeState: ReturnType<typeof useHomeState>;
  handlers: ReturnType<typeof useHomeHandlers>;
}

const HomeModals = ({ homeState, handlers }: HomeModalsProps) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { isAuthenticated } = useReduxAuth();

  const handleSwitchToSignUp = () => {
    homeState.setIsLoginModalOpen && homeState.setIsLoginModalOpen(false);
    homeState.setIsSignUpModalOpen && homeState.setIsSignUpModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    homeState.setIsSignUpModalOpen && homeState.setIsSignUpModalOpen(false);
    homeState.setIsLoginModalOpen && homeState.setIsLoginModalOpen(true);
  };

  const handleEmailLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      homeState.setIsLoginModalOpen && homeState.setIsLoginModalOpen(false);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleEmailSignUp = async (name: string, email: string, password: string) => {
    try {
      await signUp(email, password, name);
      homeState.setIsSignUpModalOpen && homeState.setIsSignUpModalOpen(false);
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      homeState.setIsLoginModalOpen && homeState.setIsLoginModalOpen(false);
      homeState.setIsSignUpModalOpen && homeState.setIsSignUpModalOpen(false);
    } catch (error) {
      console.error("Google auth error:", error);
    }
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
        onLogin={handleEmailLogin}
        onGoogleLogin={handleGoogleAuth}
        onSwitchToSignUp={handleSwitchToSignUp}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={homeState.isSignUpModalOpen || false}
        onClose={() => homeState.setIsSignUpModalOpen && homeState.setIsSignUpModalOpen(false)}
        onSignUp={handleEmailSignUp}
        onGoogleSignUp={handleGoogleAuth}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default HomeModals;
