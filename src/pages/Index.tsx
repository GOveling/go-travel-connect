
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import HomeSection from "@/components/sections/HomeSection";
import ExploreSection from "@/components/sections/ExploreSection";
import TripsSection from "@/components/sections/TripsSection";
import BookingSection from "@/components/sections/BookingSection";
import TravelersSection from "@/components/sections/TravelersSection";
import ProfileSection from "@/components/sections/ProfileSection";
import HomeModals from "@/components/home/HomeModals";
import { useHomeState } from "@/hooks/useHomeState";
import { useHomeHandlers } from "@/hooks/useHomeHandlers";
import { useAuth } from "@/hooks/useAuth";
import BackendApiExample from "@/components/BackendApiExample";

interface IndexProps {
  onSignOut: () => void;
}

const Index = ({ onSignOut }: IndexProps) => {
  const [activeSection, setActiveSection] = useState("home");
  const { user } = useAuth();

  const homeState = useHomeState();
  const homeHandlers = useHomeHandlers(homeState);

  return (
    <div className="min-h-screen bg-gray-50">
      <BottomNavigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <Toaster />
      <Sonner />
      
      <main className="pb-20">
        {activeSection === "home" && <HomeSection />}
        
        {activeSection === "explore" && <ExploreSection />}
        {activeSection === "trips" && <TripsSection />}
        {activeSection === "booking" && <BookingSection />}
        {activeSection === "travelers" && <TravelersSection />}
        
        {activeSection === "profile" && (
          <ProfileSection 
            onSignOut={onSignOut}
            user={user}
            onEditProfile={() => {}}
            onShareProfile={() => {}}
            onTravelAchievements={() => {}}
            onApiTest={() => setActiveSection("api-test")}
          />
        )}

        {activeSection === "api-test" && (
          <div className="container mx-auto px-4 py-6">
            <BackendApiExample />
          </div>
        )}
      </main>

      <HomeModals homeState={homeState} handlers={homeHandlers} />
    </div>
  );
};

export default Index;
