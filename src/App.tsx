
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthGate from "./components/auth/AuthGate";
import { useAuth } from "./hooks/useAuth";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useMemo } from "react";

// QueryClient singleton para prevenir recreaciones
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 10 * 60 * 1000, // 10 minutos
      gcTime: 15 * 60 * 1000, // 15 minutos
    },
  },
});

// Componente de loading memoizado
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-orange-500 flex items-center justify-center">
    <div className="text-white text-lg">Loading...</div>
  </div>
);

// Componente de providers memoizado
const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  </LanguageProvider>
);

const App = () => {
  const { user, loading, signOut } = useAuth();

  // Memoizar componentes para prevenir re-renderizados innecesarios
  const loadingComponent = useMemo(() => (
    <AppProviders>
      <LoadingScreen />
    </AppProviders>
  ), []);

  const authComponent = useMemo(() => (
    <AppProviders>
      <AuthGate onAuthSuccess={() => {}} />
    </AppProviders>
  ), []);

  const mainAppComponent = useMemo(() => (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index onSignOut={signOut} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  ), [signOut]);

  if (loading) {
    return loadingComponent;
  }

  if (!user) {
    return authComponent;
  }

  return mainAppComponent;
};

export default App;
