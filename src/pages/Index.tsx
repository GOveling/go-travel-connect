
import { useState, useCallback, useEffect, useRef } from "react";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import HomeSection from "@/components/sections/HomeSection";
import TripsSection from "@/components/sections/TripsSection";
import ExploreSection from "@/components/sections/ExploreSection";
import BookingSection from "@/components/sections/BookingSection";
import TravelersSection from "@/components/sections/TravelersSection";
import ProfileSection from "@/components/sections/ProfileSection";

interface IndexProps {
  onSignOut?: () => void;
}

const Index = ({ onSignOut }: IndexProps) => {
  const [activeSection, setActiveSection] = useState('home');
  const navigationInitialized = useRef(false);

  // Memoizar el handler de navegación
  const handleNavigateToTrips = useCallback(() => {
    setActiveSection('trips');
  }, []);

  // Configurar el event listener de forma más estable
  useEffect(() => {
    // Prevenir múltiples inicializaciones
    if (navigationInitialized.current) return;
    navigationInitialized.current = true;

    const handleNavigationEvent = (event: Event) => {
      console.log('Navigation event received:', event.type);
      handleNavigateToTrips();
    };

    // Usar addEventListener con options para mejor control
    window.addEventListener('navigateToTrips', handleNavigationEvent, { passive: true });

    return () => {
      navigationInitialized.current = false;
      window.removeEventListener('navigateToTrips', handleNavigationEvent);
    };
  }, [handleNavigateToTrips]);

  // Memoizar el contenido renderizado para prevenir re-renderizados innecesarios
  const renderContent = useCallback(() => {
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
  }, [activeSection, onSignOut]);

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
