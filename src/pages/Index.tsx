
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
    const sectionClass = "animate-fade-in";
    
    switch (activeSection) {
      case 'home':
        return <div className={sectionClass}><HomeSection /></div>;
      case 'trips':
        return <div className={sectionClass}><TripsSection /></div>;
      case 'explore':
        return <div className={sectionClass}><ExploreSection /></div>;
      case 'booking':
        return <div className={sectionClass}><BookingSection /></div>;
      case 'travelers':
        return <div className={sectionClass}><TravelersSection /></div>;
      case 'profile':
        return <div className={sectionClass}><ProfileSection onSignOut={onSignOut} /></div>;
      default:
        return <div className={sectionClass}><HomeSection /></div>;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 pb-20 relative overflow-hidden">
          {/* Background decoration */}
          <div className="fixed inset-0 pointer-events-none opacity-5">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1" fill="#8B5CF6" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#dots)" />
            </svg>
          </div>
          
          {/* Floating gradient orbs */}
          <div className="fixed top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="fixed bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '4s' }}></div>
          
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
