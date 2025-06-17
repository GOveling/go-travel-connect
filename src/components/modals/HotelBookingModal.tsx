
import { useState } from "react";
import { Building, X, Brain } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useHomeState } from "@/hooks/useHomeState";
import { getDestinationDateRanges } from "@/utils/dateUtils";
import TripSelectorWithAI from "./hotel-booking/TripSelectorWithAI";
import MultiDestinationBooking from "./hotel-booking/MultiDestinationBooking";
import SingleDestinationForm from "./hotel-booking/SingleDestinationForm";
import SpecialOfferCard from "./hotel-booking/SpecialOfferCard";
import AIHotelPlan from "./hotel-booking/AIHotelPlan";
import { getAIHotelBookingPlan, AIHotelBookingPlan } from "./hotel-booking/aiHotelDateUtils";

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
  const [aiHotelPlan, setAiHotelPlan] = useState<AIHotelBookingPlan | null>(null);
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
      setAiHotelPlan(null);
      return;
    }

    const selectedTrip = trips.find(trip => trip.id.toString() === tripId);
    if (selectedTrip) {
      // 🤖 AI Protocol: Generate hotel booking plan
      const aiPlan = getAIHotelBookingPlan(selectedTrip);
      setAiHotelPlan(aiPlan);

      // Check if trip has multiple destinations using coordinates
      const destinations = selectedTrip.coordinates || [];
      const isMultiDest = destinations.length > 1;
      
      setIsMultiDestination(isMultiDest);

      if (isMultiDest) {
        // Handle multi-destination trip with AI recommendations
        const bookings: DestinationBooking[] = aiPlan.recommendations.map((rec) => ({
          destination: rec.destination,
          checkIn: rec.checkIn,
          checkOut: rec.checkOut,
          guests: selectedTrip.travelers || 2,
          rooms: 1
        }));

        setMultiDestinationBookings(bookings);
        
        // Clear single destination form
        setFormData({
          destination: '',
          checkIn: '',
          checkOut: '',
          guests: 2,
          rooms: 1
        });

        // Show AI automation toast for multi-destination
        toast({
          title: "🤖 IA optimizó reservas multi-destino",
          description: `${aiPlan.recommendations.length} hoteles planificados. Confianza: ${aiPlan.aiConfidence}.`,
        });
      } else if (aiPlan.recommendations.length === 1) {
        // Handle single destination trip with AI optimization
        const rec = aiPlan.recommendations[0];
        
        setFormData(prev => ({
          ...prev,
          destination: rec.destination,
          checkIn: rec.checkIn,
          checkOut: rec.checkOut,
          guests: selectedTrip.travelers || 2
        }));
        
        setMultiDestinationBookings([]);

        // Show AI automation toast
        toast({
          title: "🤖 IA optimizó fechas de hotel",
          description: `${rec.nights} noches en ${rec.destination}. ${rec.reason}`,
        });
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
        title: "Buscando Hoteles para Todos los Destinos",
        description: `Encontrando las mejores ofertas para tus ${multiDestinationBookings.length} destinos...`,
      });
    } else {
      toast({
        title: "Buscando Hoteles",
        description: "Encontrando las mejores ofertas para tu estancia...",
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
              <h2 className="text-xl font-bold">Reserva de Hoteles</h2>
              <p className="text-sm opacity-90">IA optimiza tu estancia perfecta</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <SpecialOfferCard />

          <div className="space-y-4">
            <TripSelectorWithAI 
              selectedTripId={selectedTripId}
              trips={trips}
              onTripSelection={handleTripSelection}
            />

            {/* AI Hotel Plan Display */}
            {aiHotelPlan && selectedTripId !== 'manual' && (
              <AIHotelPlan plan={aiHotelPlan} />
            )}

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
              {isMultiDestination ? `Buscar Hoteles para ${multiDestinationBookings.length} Destinos` : 'Buscar Hoteles'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotelBookingModal;
