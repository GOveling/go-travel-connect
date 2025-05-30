
import { useState } from "react";
import FlightBookingModal from "@/components/modals/FlightBookingModal";
import HotelBookingModal from "@/components/modals/HotelBookingModal";
import CarRentalModal from "@/components/modals/CarRentalModal";
import ToursModal from "@/components/modals/ToursModal";
import RestaurantModal from "@/components/modals/RestaurantModal";
import ESIMModal from "@/components/modals/ESIMModal";
import BookingHeader from "./booking/BookingHeader";
import SpecialOfferCard from "./booking/SpecialOfferCard";
import BookingCategoriesGrid from "./booking/BookingCategoriesGrid";
import QuickBookSection from "./booking/QuickBookSection";
import RecentBookingsSection from "./booking/RecentBookingsSection";

const BookingSection = () => {
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isCarRentalModalOpen, setIsCarRentalModalOpen] = useState(false);
  const [isToursModalOpen, setIsToursModalOpen] = useState(false);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isESIMModalOpen, setIsESIMModalOpen] = useState(false);

  return (
    <div className="min-h-screen p-4 space-y-6">
      <BookingHeader />
      
      <SpecialOfferCard />

      <BookingCategoriesGrid
        onFlightClick={() => setIsFlightModalOpen(true)}
        onHotelClick={() => setIsHotelModalOpen(true)}
        onCarRentalClick={() => setIsCarRentalModalOpen(true)}
        onToursClick={() => setIsToursModalOpen(true)}
        onESIMClick={() => setIsESIMModalOpen(true)}
        onRestaurantClick={() => setIsRestaurantModalOpen(true)}
      />

      <QuickBookSection
        onFlightClick={() => setIsFlightModalOpen(true)}
        onHotelClick={() => setIsHotelModalOpen(true)}
      />

      <RecentBookingsSection />

      {/* All Modals */}
      <FlightBookingModal
        isOpen={isFlightModalOpen}
        onClose={() => setIsFlightModalOpen(false)}
      />
      
      <HotelBookingModal
        isOpen={isHotelModalOpen}
        onClose={() => setIsHotelModalOpen(false)}
      />
      
      <CarRentalModal
        isOpen={isCarRentalModalOpen}
        onClose={() => setIsCarRentalModalOpen(false)}
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
    </div>
  );
};

export default BookingSection;
