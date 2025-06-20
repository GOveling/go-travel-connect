
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
import { ThemeProvider } from "./contexts/ThemeContext";
import { ReduxProvider } from "./providers/ReduxProvider";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <ThemeProvider>
        <ReduxProvider>
          <LanguageProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <div className="app-background flex items-center justify-center">
                  <div className="text-white text-lg">Loading...</div>
                </div>
              </TooltipProvider>
            </QueryClientProvider>
          </LanguageProvider>
        </ReduxProvider>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <ReduxProvider>
          <LanguageProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AuthGate onAuthSuccess={() => {}} />
              </TooltipProvider>
            </QueryClientProvider>
          </LanguageProvider>
        </ReduxProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ReduxProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index onSignOut={signOut} />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </LanguageProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
};

export default App;
