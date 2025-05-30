
import { useState } from "react";
import { Building, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useHomeState } from "@/hooks/useHomeState";
import { getDestinationDateRanges } from "@/utils/dateUtils";
import TripSelector from "./hotel-booking/TripSelector";
import MultiDestinationBooking from "./hotel-booking/MultiDestinationBooking";
import SingleDestinationForm from "./hotel-booking/SingleDestinationForm";
import SpecialOfferCard from "./hotel-booking/SpecialOfferCard";

interface HotelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DestinationBooking {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

const HotelBookingModal = ({ isOpen, onClose }: HotelBookingModalProps) => {
  const [formData, setFormData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1
  });
  const [selectedTripId, setSelectedTripId] = useState<string>('manual');
  const [multiDestinationBookings, setMultiDestinationBookings] = useState<DestinationBooking[]>([]);
  const [isMultiDestination, setIsMultiDestination] = useState(false);
  const { toast } = useToast();
  const { trips } = useHomeState();

  const handleTripSelection = (tripId: string) => {
    setSelectedTripId(tripId);
    
    if (tripId === 'manual') {
      // Reset form when manual entry is selected
      setFormData({
        destination: '',
        checkIn: '',
        checkOut: '',
        guests: 2,
        rooms: 1
      });
      setMultiDestinationBookings([]);
      setIsMultiDestination(false);
      return;
    }

    const selectedTrip = trips.find(trip => trip.id.toString() === tripId);
    if (selectedTrip) {
      // Check if trip has multiple destinations using coordinates
      const destinations = selectedTrip.coordinates || [];
      const isMultiDest = destinations.length > 1;
      
      setIsMultiDestination(isMultiDest);

      if (isMultiDest) {
        // Handle multi-destination trip
        const dateRanges = getDestinationDateRanges(selectedTrip.dates, destinations.length);
        
        const bookings: DestinationBooking[] = destinations.map((dest, index) => {
          const range = dateRanges[index];
          const formatDateForInput = (date: Date) => {
            return date.toISOString().split('T')[0];
          };

          return {
            destination: dest.name,
            checkIn: formatDateForInput(range.startDate),
            checkOut: formatDateForInput(range.endDate),
            guests: selectedTrip.travelers || 2,
            rooms: 1
          };
        });

        setMultiDestinationBookings(bookings);
        
        // Clear single destination form
        setFormData({
          destination: '',
          checkIn: '',
          checkOut: '',
          guests: 2,
          rooms: 1
        });
      } else {
        // Handle single destination trip (existing logic)
        const parseTripDates = (dateStr: string) => {
          try {
            const [dateRange, year] = dateStr.split(', ');
            const [startDate, endDate] = dateRange.split(' - ');
            const currentYear = year || new Date().getFullYear().toString();
            
            const parseDate = (dateStr: string) => {
              const [month, day] = dateStr.trim().split(' ');
              const monthMap: { [key: string]: string } = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
              };
              const monthNum = monthMap[month] || '01';
              const dayNum = day.padStart(2, '0');
              return `${currentYear}-${monthNum}-${dayNum}`;
            };

            return {
              checkIn: parseDate(startDate),
              checkOut: parseDate(endDate)
            };
          } catch (error) {
            console.log('Error parsing dates:', error);
            return { checkIn: '', checkOut: '' };
          }
        };

        const { checkIn, checkOut } = parseTripDates(selectedTrip.dates);
        
        setFormData(prev => ({
          ...prev,
          destination: destinations[0]?.name || selectedTrip.destination,
          checkIn,
          checkOut,
          guests: selectedTrip.travelers || 2
        }));
        
        setMultiDestinationBookings([]);
      }
    }
  };

  const updateMultiDestinationBooking = (index: number, field: keyof DestinationBooking, value: string | number) => {
    setMultiDestinationBookings(prev => 
      prev.map((booking, i) => 
        i === index ? { ...booking, [field]: value } : booking
      )
    );
  };

  const handleSearch = () => {
    if (isMultiDestination) {
      toast({
        title: "Searching Hotels for All Destinations",
        description: `Finding the best deals for your ${multiDestinationBookings.length} destinations...`,
      });
    } else {
      toast({
        title: "Searching Hotels",
        description: "Finding the best deals for your stay...",
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Building size={24} />
            <div>
              <h2 className="text-xl font-bold">Hotel Booking</h2>
              <p className="text-sm opacity-90">Find your perfect stay</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <SpecialOfferCard />

          <div className="space-y-4">
            <TripSelector 
              selectedTripId={selectedTripId}
              trips={trips}
              onTripSelection={handleTripSelection}
            />

            {/* Multi-destination bookings */}
            {isMultiDestination && multiDestinationBookings.length > 0 && (
              <MultiDestinationBooking 
                bookings={multiDestinationBookings}
                onUpdateBooking={updateMultiDestinationBooking}
              />
            )}

            {/* Single destination form (only show when not multi-destination) */}
            {!isMultiDestination && (
              <SingleDestinationForm 
                formData={formData}
                onFormDataChange={setFormData}
              />
            )}

            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-green-500 to-green-600"
            >
              <Building size={16} className="mr-2" />
              {isMultiDestination ? `Search Hotels for ${multiDestinationBookings.length} Destinations` : 'Search Hotels'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotelBookingModal;
