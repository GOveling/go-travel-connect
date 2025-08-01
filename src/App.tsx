import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AcceptInvitation from "./pages/AcceptInvitation";
import AuthGate from "./components/auth/AuthGate";
import AuthDebug from "./components/debug/AuthDebug";
import { useAuth } from "./hooks/useAuth";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ReduxProvider } from "./providers/ReduxProvider";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
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
              <AuthGate onAuthSuccess={() => {}} />
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
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index onSignOut={signOut} />} />
                <Route path="/trips/:tripId/join" element={<AcceptInvitation />} />
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
