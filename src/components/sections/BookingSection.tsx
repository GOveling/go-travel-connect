
import { useState } from "react";
import FlightBookingModal from "@/components/modals/FlightBookingModal";
import HotelBookingModal from "@/components/modals/HotelBookingModal";
import TransportationModal from "@/components/modals/TransportationModal";
import ToursModal from "@/components/modals/ToursModal";
import RestaurantModal from "@/components/modals/RestaurantModal";
import ESIMModal from "@/components/modals/ESIMModal";
import { useLanguage } from "@/contexts/LanguageContext";
import BookingHeader from "./booking/BookingHeader";
import SpecialOfferCard from "./booking/SpecialOfferCard";
import BookingCategoriesGrid from "./booking/BookingCategoriesGrid";
import QuickBookSection from "./booking/QuickBookSection";
import RecentBookingsSection from "./booking/RecentBookingsSection";
import GlassCard from "@/components/ui/glass-card";
import AnimatedContainer from "@/components/ui/animated-container";

const BookingSection = () => {
  const { t } = useLanguage();
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isTransportationModalOpen, setIsTransportationModalOpen] = useState(false);
  const [isToursModalOpen, setIsToursModalOpen] = useState(false);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isESIMModalOpen, setIsESIMModalOpen] = useState(false);

  return (
    <AnimatedContainer className="min-h-screen p-4 space-y-6" animation="fade-in">
      <GlassCard>
        <BookingHeader />
      </GlassCard>
      
      <SpecialOfferCard />

      <GlassCard>
        <BookingCategoriesGrid
          onFlightClick={() => setIsFlightModalOpen(true)}
          onHotelClick={() => setIsHotelModalOpen(true)}
          onCarRentalClick={() => setIsTransportationModalOpen(true)}
          onToursClick={() => setIsToursModalOpen(true)}
          onESIMClick={() => setIsESIMModalOpen(true)}
          onRestaurantClick={() => setIsRestaurantModalOpen(true)}
        />
      </GlassCard>

      <GlassCard>
        <QuickBookSection
          onFlightClick={() => setIsFlightModalOpen(true)}
          onHotelClick={() => setIsHotelModalOpen(true)}
        />
      </GlassCard>

      <GlassCard>
        <RecentBookingsSection />
      </GlassCard>

      {/* All Modals */}
      <FlightBookingModal
        isOpen={isFlightModalOpen}
        onClose={() => setIsFlightModalOpen(false)}
      />
      
      <HotelBookingModal
        isOpen={isHotelModalOpen}
        onClose={() => setIsHotelModalOpen(false)}
      />
      
      <TransportationModal
        isOpen={isTransportationModalOpen}
        onClose={() => setIsTransportationModalOpen(false)}
      />
      
      <ToursModal
        isOpen={isToursModalOpen}
        onClose={() => setIsToursModalOpen(false)}
      />
      
      <RestaurantModal
        isOpen={isRestaurantModalOpen}
        onClose={() => setIsRestaurantModalOpen(false)}
      />

      <ESIMModal
        isOpen={isESIMModalOpen}
        onClose={() => setIsESIMModalOpen(false)}
      />
    </AnimatedContainer>
  );
};

export default BookingSection;
