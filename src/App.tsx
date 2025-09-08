import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AcceptInvitation from "./pages/AcceptInvitation";
import Index from "./pages/Index";
import InvitationLanding from "./pages/InvitationLanding";
import NotFound from "./pages/NotFound";
import TravelModePage from "./pages/TravelModePage";

import AuthGate from "./components/auth/AuthGate";
import NewUserPersonalInfoModal from "./components/modals/NewUserPersonalInfoModal";
import WelcomeModal from "./components/modals/WelcomeModal";
import { LanguageProvider } from "./contexts/LanguageContext";
import { TravelModeProvider } from "./contexts/TravelModeContext";
import { useAuth } from "./hooks/useAuth";
import { useWelcomeFlow } from "./hooks/useWelcomeFlow";
import { ReduxProvider } from "./providers/ReduxProvider";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading, signOut } = useAuth();
  const {
    showWelcome,
    showPersonalInfo,
    loading: welcomeLoading,
    completeWelcome,
    completeOnboarding,
    skipOnboardingForNow,
  } = useWelcomeFlow();

  if (loading || welcomeLoading) {
    return (
      <ReduxProvider>
        <LanguageProvider>
          <TravelModeProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-orange-500 flex items-center justify-center">
                  <div className="text-white text-lg">Cargando...</div>
                </div>
              </TooltipProvider>
            </QueryClientProvider>
          </TravelModeProvider>
        </LanguageProvider>
      </ReduxProvider>
    );
  }

  if (!user) {
    return (
      <ReduxProvider>
        <LanguageProvider>
          <TravelModeProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/join/:token" element={<InvitationLanding />} />
                    <Route
                      path="*"
                      element={<AuthGate onAuthSuccess={() => {}} />}
                    />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </QueryClientProvider>
          </TravelModeProvider>
        </LanguageProvider>
      </ReduxProvider>
    );
  }

  return (
    <ReduxProvider>
      <LanguageProvider>
        <TravelModeProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />

              {/* Welcome Flow Modals */}
              <WelcomeModal isOpen={showWelcome} onClose={completeWelcome} />
              <NewUserPersonalInfoModal
                isOpen={showPersonalInfo}
                onClose={skipOnboardingForNow}
                onComplete={completeOnboarding}
              />

              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index onSignOut={signOut} />} />
                  <Route path="/travel-mode" element={<TravelModePage />} />
                  <Route
                    path="/accept-invitation"
                    element={<AcceptInvitation />}
                  />
                  <Route path="/join/:token" element={<InvitationLanding />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </TravelModeProvider>
      </LanguageProvider>
    </ReduxProvider>
  );
};

export default App;
