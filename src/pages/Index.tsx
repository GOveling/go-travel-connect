
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import HomeSection from "@/components/sections/HomeSection";
import TripsSection from "@/components/sections/TripsSection";
import ExploreSection from "@/components/sections/ExploreSection";
import BookingSection from "@/components/sections/BookingSection";
import TravelersSection from "@/components/sections/TravelersSection";
import ProfileSection from "@/components/sections/ProfileSection";

const queryClient = new QueryClient();

interface IndexProps {
  onSignOut?: () => void;
}

const Index = ({ onSignOut }: IndexProps) => {
  const [activeSection, setActiveSection] = useState('home');

  // Listen for navigation events
  const handleNavigateToTrips = () => {
    setActiveSection('trips');
  };

  // Add event listener for navigation
  window.addEventListener('navigateToTrips', handleNavigateToTrips);

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomeSection />;
      case 'trips':
        return <TripsSection />;
      case 'explore':
        return <ExploreSection />;
      case 'booking':
        return <BookingSection />;
      case 'travelers':
        return <TravelersSection />;
      case 'profile':
        return <ProfileSection onSignOut={onSignOut} />;
      default:
        return <HomeSection />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 pb-20">
          {renderContent()}
          <BottomNavigation 
            activeTab={activeSection} 
            setActiveTab={setActiveSection}
          />
        </div>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Index;
