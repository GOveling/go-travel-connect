
import { useState } from "react";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import MobileNavigation from "@/components/mobile/MobileNavigation";
import MobileHeader from "@/components/mobile/MobileHeader";
import HomeSection from "@/components/sections/HomeSection";
import TripsSection from "@/components/sections/TripsSection";
import ExploreSection from "@/components/sections/ExploreSection";
import BookingSection from "@/components/sections/BookingSection";
import TravelersSection from "@/components/sections/TravelersSection";
import ProfileSection from "@/components/sections/ProfileSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { getEnvironmentConfig } from "@/utils/environment";

interface IndexProps {
  onSignOut?: () => void;
}

const Index = ({ onSignOut }: IndexProps) => {
  const [activeSection, setActiveSection] = useState('home');
  const isMobile = useIsMobile();
  const envConfig = getEnvironmentConfig();

  // Listen for navigation events
  const handleNavigateToTrips = () => {
    setActiveSection('trips');
  };

  // Add event listener for navigation
  window.addEventListener('navigateToTrips', handleNavigateToTrips);

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'home': return 'Goveling';
      case 'trips': return 'Mis Viajes';
      case 'explore': return 'Explorar';
      case 'booking': return 'Reservas';
      case 'travelers': return 'Viajeros';
      case 'profile': return 'Mi Perfil';
      default: return 'Goveling';
    }
  };

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

  // Para aplicaciones móviles/Capacitor, usar navegación optimizada
  if (isMobile || envConfig.isCapacitor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MobileHeader
          title={getSectionTitle()}
          showNotifications={activeSection === 'home'}
          notificationCount={0}
        />
        
        <div className="flex-1 overflow-y-auto pb-20">
          {renderContent()}
        </div>
        
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
