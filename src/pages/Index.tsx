
import { useState } from "react";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import HomeSection from "@/components/sections/HomeSection";
import TripsSection from "@/components/sections/TripsSection";
import ExploreSection from "@/components/sections/ExploreSection";
import BookingSection from "@/components/sections/BookingSection";
import TravelersSection from "@/components/sections/TravelersSection";
import ProfileSection from "@/components/sections/ProfileSection";
import ThemeToggle from "@/components/ui/theme-toggle";

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
    <div className="app-background pb-20">
      <ThemeToggle />
      {renderContent()}
      <BottomNavigation 
        activeTab={activeSection} 
        setActiveTab={setActiveSection}
      />
    </div>
  );
};

export default Index;
