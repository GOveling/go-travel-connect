import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { HomeSection } from "@/components/sections/HomeSection";
import { ExploreSection } from "@/components/sections/ExploreSection";
import { TripsSection } from "@/components/sections/TripsSection";
import { BookingSection } from "@/components/sections/BookingSection";
import { TravelersSection } from "@/components/sections/TravelersSection";
import { ProfileSection } from "@/components/sections/ProfileSection";
import { HomeModals } from "@/components/home/HomeModals";
import { useHomeState } from "@/hooks/useHomeState";
import { useHomeHandlers } from "@/hooks/useHomeHandlers";
import BackendApiExample from "@/components/BackendApiExample";

interface IndexProps {
  onSignOut: () => void;
}

const Index = ({ onSignOut }: IndexProps) => {
  const [activeSection, setActiveSection] = useState("home");
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [isProfilePublicationModalOpen, setIsProfilePublicationModalOpen] = useState(false);
  const [isInstaTripModalOpen, setIsInstaTripModalOpen] = useState(false);
  const [isAddMemoryModalOpen, setIsAddMemoryModalOpen] = useState(false);
  const [isViewProfileModalOpen, setIsViewProfileModalOpen] = useState(false);
  const [isShareProfileModalOpen, setIsShareProfileModalOpen] = useState(false);
  const [isTravelAchievementsModalOpen, setIsTravelAchievementsModalOpen] = useState(false);

  const { user } = useHomeState();
  const { handleCloseAllModals } = useHomeHandlers(
    setIsNotificationsModalOpen,
    setIsNewTripModalOpen,
    setIsProfilePublicationModalOpen,
    setIsInstaTripModalOpen,
    setIsAddMemoryModalOpen,
    setIsViewProfileModalOpen,
    setIsShareProfileModalOpen,
    setIsTravelAchievementsModalOpen
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <BottomNavigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <Toaster />
      <Sonner />
      
      <main className="pb-20">
        {activeSection === "home" && (
          <HomeSection 
            user={user}
            onNotificationsClick={() => setIsNotificationsModalOpen(true)}
            onNewTripClick={() => setIsNewTripModalOpen(true)}
            onProfilePublicationClick={() => setIsProfilePublicationModalOpen(true)}
            onInstaTripClick={() => setIsInstaTripModalOpen(true)}
            onAddMemoryClick={() => setIsAddMemoryModalOpen(true)}
          />
        )}
        
        {activeSection === "explore" && <ExploreSection />}
        {activeSection === "trips" && <TripsSection />}
        {activeSection === "booking" && <BookingSection />}
        {activeSection === "travelers" && <TravelersSection />}
        
        {activeSection === "profile" && (
          <ProfileSection 
            onSignOut={onSignOut}
            user={user}
            onEditProfile={() => setIsViewProfileModalOpen(true)}
            onShareProfile={() => setIsShareProfileModalOpen(true)}
            onTravelAchievements={() => setIsTravelAchievementsModalOpen(true)}
            onApiTest={() => setActiveSection("api-test")}
          />
        )}

        {activeSection === "api-test" && (
          <div className="container mx-auto px-4 py-6">
            <BackendApiExample />
          </div>
        )}
      </main>

      <HomeModals
        isNotificationsModalOpen={isNotificationsModalOpen}
        isNewTripModalOpen={isNewTripModalOpen}
        isProfilePublicationModalOpen={isProfilePublicationModalOpen}
        isInstaTripModalOpen={isInstaTripModalOpen}
        isAddMemoryModalOpen={isAddMemoryModalOpen}
        isViewProfileModalOpen={isViewProfileModalOpen}
        isShareProfileModalOpen={isShareProfileModalOpen}
        isTravelAchievementsModalOpen={isTravelAchievementsModalOpen}
        onClose={handleCloseAllModals}
      />
    </div>
  );
};

export default Index;
