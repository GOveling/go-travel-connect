import BottomNavigation from "@/components/navigation/BottomNavigation";
import BookingSection from "@/components/sections/BookingSection";
import ExploreSection from "@/components/sections/ExploreSection";
import HomeSection from "@/components/sections/HomeSection";
import ProfileSection from "@/components/sections/ProfileSection";
import TravelersSection from "@/components/sections/TravelersSection";
import TripsSection from "@/components/sections/TripsSection";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";

interface IndexProps {
  onSignOut?: () => void;
}

const Index = ({ onSignOut }: IndexProps) => {
  const [activeSection, setActiveSection] = useState("home");
  const [exploreContext, setExploreContext] = useState<any>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Listen for navigation events
    const handleNavigateToTrips = () => {
      setActiveSection("trips");
    };

    const handleNavigateToExplore = (event: CustomEvent) => {
      setActiveSection("explore");
      if (event.detail) {
        setExploreContext(event.detail);
      }
    };

    // Add event listeners for navigation
    window.addEventListener("navigateToTrips", handleNavigateToTrips);
    window.addEventListener(
      "navigateToExplore",
      handleNavigateToExplore as EventListener
    );

    return () => {
      window.removeEventListener("navigateToTrips", handleNavigateToTrips);
      window.removeEventListener(
        "navigateToExplore",
        handleNavigateToExplore as EventListener
      );
    };
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection />;
      case "trips":
        return <TripsSection />;
      case "explore":
        return (
          <ExploreSection
            sourceTrip={exploreContext?.sourceTrip}
            searchType={exploreContext?.searchType}
            onClearSourceTrip={() => setExploreContext(null)}
          />
        );
      case "booking":
        return <BookingSection />;
      case "travelers":
        return <TravelersSection />;
      case "profile":
        return <ProfileSection onSignOut={onSignOut} />;
      default:
        return <HomeSection />;
    }
  };

  // Usar la misma navegación limpia en todas las resoluciones
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {renderContent()}
      <BottomNavigation
        activeTab={activeSection}
        setActiveTab={setActiveSection}
      />
    </div>
  );
};

export default Index;
