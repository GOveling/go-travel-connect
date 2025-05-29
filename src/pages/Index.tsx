import { useState, useEffect } from "react";
import { Home, Compass, MapPin, Calendar, User } from "lucide-react";
import HomeSection from "@/components/sections/HomeSection";
import ExploreSection from "@/components/sections/ExploreSection";
import TripsSection from "@/components/sections/TripsSection";
import BookingSection from "@/components/sections/BookingSection";
import ProfileSection from "@/components/sections/ProfileSection";
import BottomNavigation from "@/components/navigation/BottomNavigation";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  // Listen for navigation events from child components
  useEffect(() => {
    const handleNavigateToExplore = () => {
      setActiveTab("explore");
    };

    window.addEventListener('navigateToExplore', handleNavigateToExplore);
    
    return () => {
      window.removeEventListener('navigateToExplore', handleNavigateToExplore);
    };
  }, []);

  const renderActiveSection = () => {
    switch (activeTab) {
      case "home":
        return <HomeSection />;
      case "explore":
        return <ExploreSection />;
      case "trips":
        return <TripsSection />;
      case "booking":
        return <BookingSection />;
      case "profile":
        return <ProfileSection />;
      default:
        return <HomeSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="pb-20">
        {renderActiveSection()}
      </div>
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Index;
