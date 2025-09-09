import { useEffect, useState } from "react";
import NotificationAlertsModal from "@/components/modals/NotificationAlertsModal";
import NewTripModal from "@/components/modals/NewTripModal";
import TripDetailModal from "@/components/modals/TripDetailModal";
import LoginModal from "@/components/modals/LoginModal";
import SignUpModal from "@/components/modals/SignUpModal";
import ClientOnly from "@/components/ui/ClientOnly";
import { useHomeState } from "@/hooks/useHomeState";
import { useHomeHandlers } from "@/hooks/useHomeHandlers";
import { useAuth } from "@/hooks/useAuth";
import ConfirmationCodeModal from "@/components/modals/ConfirmationCodeModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useReduxAuth } from "@/hooks/useReduxAuth";

interface HomeModalsProps {
  homeState: ReturnType<typeof useHomeState>;
  handlers: ReturnType<typeof useHomeHandlers>;
}

const HomeModals = ({ homeState, handlers }: HomeModalsProps) => {
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const { isAuthenticated } = useReduxAuth();
  const [modalTrip, setModalTrip] = useState<any>(null);
  const [isGlobalConfirmOpen, setIsGlobalConfirmOpen] = useState(false);
  const [globalConfirmEmail, setGlobalConfirmEmail] = useState("");
  const { toast } = useToast();

  // Listen for custom event to open trip detail modal
  useEffect(() => {
    const handleOpenTripDetailModal = (event: CustomEvent) => {
      const { tripId } = event.detail;
      const trip = homeState.trips.find((t) => t.id === tripId);
      if (trip) {
        setModalTrip(trip);
        homeState.setIsTripDetailModalOpen(true);
      }
    };

    window.addEventListener(
      "openTripDetailModal",
      handleOpenTripDetailModal as EventListener
    );
    return () => {
      window.removeEventListener(
        "openTripDetailModal",
        handleOpenTripDetailModal as EventListener
      );
    };
  }, [homeState]);
  useEffect(() => {
    if (user?.id) {
      const key = `new_signup_${user.id}`;
      const flag = sessionStorage.getItem(key);
      if (flag) {
        setGlobalConfirmEmail(user.email || "");
        setIsGlobalConfirmOpen(true);
        sessionStorage.removeItem(key);
        toast({
          title: "Revisa tu email",
          description: "Ingresa el código de confirmación para activar tu cuenta.",
        });
      }
    }
  }, [user]);

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
      const result = await signIn(email, password);
      // Only close modal on successful login
      if (!result?.error) {
        homeState.setIsLoginModalOpen && homeState.setIsLoginModalOpen(false);
      }
      return result;
    } catch (error) {
      console.error("Login error:", error);
      return { error };
    }
  };

  const handleEmailSignUp = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      const result = await signUp(email, password, name);
      console.log("HomeModals: signUp result", result);
      // Return the result so SignUpModal can handle the flow
      return result;
    } catch (error) {
      console.error("Sign up error:", error);
      return { error };
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

  const handleGlobalConfirmationCode = async (token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: globalConfirmEmail,
        token,
        type: 'signup',
      });
      if (error) throw error;
      setIsGlobalConfirmOpen(false);
      toast({ title: '¡Email verificado!', description: 'Tu cuenta ha sido activada.' });
    } catch (error: any) {
      console.error('OTP verify error:', error);
      throw new Error(error.message || 'Error al verificar el código');
    }
  };

  const handleUpdateTrip = async (updatedTrip: any) => {
    // Use the homeState updateTrip function to update in Supabase and local state
    await homeState.updateTrip(updatedTrip.id, updatedTrip);
  };

  return (
    <>
      <ClientOnly fallback={<div>Loading...</div>}>
        <NotificationAlertsModal
          isOpen={homeState.isNotificationModalOpen}
          onClose={() => homeState.setIsNotificationModalOpen(false)}
          notificationCount={0}
          onMarkAllRead={handlers.handleMarkAllNotificationsRead}
        />

        <NewTripModal
          isOpen={homeState.isNewTripModalOpen}
          onClose={() => homeState.setIsNewTripModalOpen(false)}
          onCreateTrip={handlers.handleCreateTrip}
        />

        <TripDetailModal
          isOpen={homeState.isTripDetailModalOpen}
          onClose={() => {
            homeState.setIsTripDetailModalOpen(false);
            setModalTrip(null);
          }}
          trip={modalTrip || homeState.currentTrip}
          onUpdateTrip={handleUpdateTrip}
        />

        {/* Login Modal */}
        <LoginModal
          isOpen={homeState.isLoginModalOpen || false}
          onClose={() =>
            homeState.setIsLoginModalOpen &&
            homeState.setIsLoginModalOpen(false)
          }
          onLogin={handleEmailLogin}
          onGoogleLogin={handleGoogleAuth}
          onSwitchToSignUp={handleSwitchToSignUp}
        />

        {/* Sign Up Modal */}
        <SignUpModal
          isOpen={homeState.isSignUpModalOpen || false}
          onClose={() =>
            homeState.setIsSignUpModalOpen &&
            homeState.setIsSignUpModalOpen(false)
          }
          onSignUp={handleEmailSignUp}
          onGoogleSignUp={handleGoogleAuth}
          onSwitchToLogin={handleSwitchToLogin}
        />

        {/* Global Confirmation Code Modal (e.g., after Google first signup) */}
        <ConfirmationCodeModal
          isOpen={isGlobalConfirmOpen}
          onClose={() => setIsGlobalConfirmOpen(false)}
          onConfirm={handleGlobalConfirmationCode}
          email={globalConfirmEmail}
        />
      </ClientOnly>
    </>
  );
};

export default HomeModals;
