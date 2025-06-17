
import { useState, useMemo } from "react";
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

const BookingSection = () => {
  const { t } = useLanguage();
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isTransportationModalOpen, setIsTransportationModalOpen] = useState(false);
  const [isToursModalOpen, setIsToursModalOpen] = useState(false);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isESIMModalOpen, setIsESIMModalOpen] = useState(false);

  // Memoizar los handlers para evitar re-renders innecesarios
  const modalHandlers = useMemo(() => ({
    openFlight: () => setIsFlightModalOpen(true),
    closeFlight: () => setIsFlightModalOpen(false),
    openHotel: () => setIsHotelModalOpen(true),
    closeHotel: () => setIsHotelModalOpen(false),
    openTransportation: () => setIsTransportationModalOpen(true),
    closeTransportation: () => setIsTransportationModalOpen(false),
    openTours: () => setIsToursModalOpen(true),
    closeTours: () => setIsToursModalOpen(false),
    openRestaurant: () => setIsRestaurantModalOpen(true),
    closeRestaurant: () => setIsRestaurantModalOpen(false),
    openESIM: () => setIsESIMModalOpen(true),
    closeESIM: () => setIsESIMModalOpen(false),
  }), []);

  return (
    <div className="min-h-screen p-4 space-y-6">
      <BookingHeader />
      
      <SpecialOfferCard />

      <BookingCategoriesGrid
        onFlightClick={modalHandlers.openFlight}
        onHotelClick={modalHandlers.openHotel}
        onCarRentalClick={modalHandlers.openTransportation}
        onToursClick={modalHandlers.openTours}
        onESIMClick={modalHandlers.openESIM}
        onRestaurantClick={modalHandlers.openRestaurant}
      />

      <QuickBookSection
        onFlightClick={modalHandlers.openFlight}
        onHotelClick={modalHandlers.openHotel}
      />

      <RecentBookingsSection />

      {/* All Modals */}
      <FlightBookingModal
        isOpen={isFlightModalOpen}
        onClose={modalHandlers.closeFlight}
      />
      
      <HotelBookingModal
        isOpen={isHotelModalOpen}
        onClose={modalHandlers.closeHotel}
      />
      
      <TransportationModal
        isOpen={isTransportationModalOpen}
        onClose={modalHandlers.closeTransportation}
      />
      
      <ToursModal
        isOpen={isToursModalOpen}
        onClose={modalHandlers.closeTours}
      />
      
      <RestaurantModal
        isOpen={isRestaurantModalOpen}
        onClose={modalHandlers.closeRestaurant}
      />

      <ESIMModal
        isOpen={isESIMModalOpen}
        onClose={modalHandlers.closeESIM}
      />
    </div>
  );
};

export default BookingSection;
