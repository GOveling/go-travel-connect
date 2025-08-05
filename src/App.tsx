import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import AcceptInvitation from "./pages/AcceptInvitation";
import InvitationLanding from "./pages/InvitationLanding";
import AuthGate from "./components/auth/AuthGate";
import AuthDebug from "./components/debug/AuthDebug";
import { useAuth } from "./hooks/useAuth";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ReduxProvider } from "./providers/ReduxProvider";
import { useWelcomeFlow } from "./hooks/useWelcomeFlow";
import WelcomeModal from "./components/modals/WelcomeModal";
import NewUserPersonalInfoModal from "./components/modals/NewUserPersonalInfoModal";
import { useEffect } from 'react';

const queryClient = new QueryClient();

const App = () => {
  const { user, loading } = useAuth();
  const { 
    showWelcome, 
    showPersonalInfo, 
    loading: welcomeLoading,
    completeWelcome,
    completeOnboarding 
  } = useWelcomeFlow();

  // Optimize for mobile view
  useEffect(() => {
    // Set viewport meta tag for better mobile experience
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    
    // Add mobile-specific body class
    document.body.classList.add('mobile-app');
    
    return () => {
      document.body.classList.remove('mobile-app');
    };
  }, []);

  if (loading || welcomeLoading) {
    return (
      <ReduxProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-orange-500 flex items-center justify-center">
                <div className="text-white text-lg">Cargando...</div>
              </div>
              <AuthDebug />
            </TooltipProvider>
          </QueryClientProvider>
        </LanguageProvider>
      </ReduxProvider>
    );
  }

  if (!user) {
    return (
      <ReduxProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/join/:token" element={<InvitationLanding />} />
                  <Route path="*" element={<AuthGate onAuthSuccess={() => {}} />} />
                </Routes>
              </BrowserRouter>
              <AuthDebug />
            </TooltipProvider>
          </QueryClientProvider>
        </LanguageProvider>
      </ReduxProvider>
    );
  }

  return (
    <ReduxProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            
            {/* Welcome Flow Modals */}
            <WelcomeModal 
              isOpen={showWelcome} 
              onClose={completeWelcome} 
            />
            <NewUserPersonalInfoModal
              isOpen={showPersonalInfo}
              onClose={() => {}}
              onComplete={completeOnboarding}
            />
            
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/accept-invitation" element={<AcceptInvitation />} />
                <Route path="/join/:token" element={<InvitationLanding />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <AuthDebug />
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ReduxProvider>
  );
};

export default App;
