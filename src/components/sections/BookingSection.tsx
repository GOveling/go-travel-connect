
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

const BookingSection = () => {
  const { t } = useLanguage();
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isTransportationModalOpen, setIsTransportationModalOpen] = useState(false);
  const [isToursModalOpen, setIsToursModalOpen] = useState(false);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isESIMModalOpen, setIsESIMModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="p-4 space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl text-white shadow-lg">
          <BookingHeader />
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
          <SpecialOfferCard />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
          <BookingCategoriesGrid
            onFlightClick={() => setIsFlightModalOpen(true)}
            onHotelClick={() => setIsHotelModalOpen(true)}
            onCarRentalClick={() => setIsTransportationModalOpen(true)}
            onToursClick={() => setIsToursModalOpen(true)}
            onESIMClick={() => setIsESIMModalOpen(true)}
            onRestaurantClick={() => setIsRestaurantModalOpen(true)}
          />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
          <QuickBookSection
            onFlightClick={() => setIsFlightModalOpen(true)}
            onHotelClick={() => setIsHotelModalOpen(true)}
          />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
          <RecentBookingsSection />
        </div>

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
      </div>
    </div>
  );
};

export default BookingSection;
