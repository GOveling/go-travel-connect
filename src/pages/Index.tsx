import BottomNavigation from "@/components/navigation/BottomNavigation";
import BookingSection from "@/components/sections/BookingSection";
import ExploreSection from "@/components/sections/ExploreSection";
import HomeSection from "@/components/sections/HomeSection";
import ProfileSection from "@/components/sections/ProfileSection";
import TravelersSection from "@/components/sections/TravelersSection";
import TripsSection from "@/components/sections/TripsSection";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface IndexProps {
  onSignOut?: () => void;
}

const Index = ({ onSignOut }: IndexProps) => {
  const [activeSection, setActiveSection] = useState("home");
  const [sourceTrip, setSourceTrip] = useState<object | null>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for navigation events
  const handleNavigateToTrips = () => {
    setActiveSection("trips");
  };

  const handleNavigateToExplore = (event: CustomEvent) => {
    const tripDetail = event.detail?.sourceTrip;
    setSourceTrip(tripDetail);
    setActiveSection("explore");
  };

  // Handle URL parameters for trip invitations/viewing
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const joinTripId = params.get('join');
    const viewTripId = params.get('view');
    
    if (joinTripId || viewTripId) {
      // Clean the URL without reloading the page
      window.history.replaceState({}, '', window.location.pathname);
      
      if (joinTripId) {
        // Trigger invitation flow for the trip
        window.dispatchEvent(new CustomEvent('openTripInvitation', { 
          detail: { tripId: joinTripId } 
        }));
      } else if (viewTripId) {
        // Trigger trip view modal
        window.dispatchEvent(new CustomEvent('openTripDetailModal', { 
          detail: { tripId: viewTripId } 
        }));
      }
    }
  }, [location.search]);

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
