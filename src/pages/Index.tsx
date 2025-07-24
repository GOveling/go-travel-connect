import MobileNavigation from "@/components/mobile/MobileNavigation";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import BookingSection from "@/components/sections/BookingSection";
import ExploreSection from "@/components/sections/ExploreSection";
import HomeSection from "@/components/sections/HomeSection";
import ProfileSection from "@/components/sections/ProfileSection";
import TravelersSection from "@/components/sections/TravelersSection";
import TripsSection from "@/components/sections/TripsSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/hooks/useLanguage";
import { getEnvironmentConfig } from "@/utils/environment";
import { useState } from "react";

interface IndexProps {
  onSignOut?: () => void;
}

const Index = ({ onSignOut }: IndexProps) => {
  const [activeSection, setActiveSection] = useState("home");
  const [sourceTrip, setSourceTrip] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const config = getEnvironmentConfig();
  const { t } = useLanguage();

  // Listen for navigation events
  const handleNavigateToTrips = () => {
    setActiveSection("trips");
  };

  const handleNavigateToExplore = (event: any) => {
    const tripDetail = event.detail?.sourceTrip;
    setSourceTrip(tripDetail);
    setActiveSection("explore");
  };

  // Add event listeners for navigation
  window.addEventListener("navigateToTrips", handleNavigateToTrips);
  window.addEventListener("navigateToExplore", handleNavigateToExplore);

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection />;
      case "trips":
        return <TripsSection />;
      case "explore":
        return (
          <ExploreSection
            sourceTrip={sourceTrip}
            onClearSourceTrip={() => setSourceTrip(null)}
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

  // Para aplicaciones móviles/Capacitor, usar navegación optimizada
  if (isMobile || config.isCapacitor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 overflow-y-auto pb-20">{renderContent()}</div>

        <MobileNavigation
          activeTab={activeSection}
          onTabChange={setActiveSection}
        />
      </div>
    );
  }

  // Para web, mantener navegación existente
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
