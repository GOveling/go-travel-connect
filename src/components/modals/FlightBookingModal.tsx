
import { useState, useEffect } from "react";
import { Plane, Calendar, CreditCard, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHomeState } from "@/hooks/useHomeState";
import { useToast } from "@/hooks/use-toast";
import FlightBookingSteps from "./flight-booking/FlightBookingSteps";
import TripSelectionStep from "./flight-booking/TripSelectionStep";
import FlightDetailsStep from "./flight-booking/FlightDetailsStep";
import ConfirmationStep from "./flight-booking/ConfirmationStep";
import { extractStartDate, extractEndDate } from "./flight-booking/flightBookingUtils";

interface FlightBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlightBookingModal = ({ isOpen, onClose }: FlightBookingModalProps) => {
  const [activeStep, setActiveStep] = useState(1);
  const [tripType, setTripType] = useState<'round-trip' | 'one-way'>('round-trip');
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState("New York, NY");
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy'
  });

  const { trips } = useHomeState();
  const { toast } = useToast();

  // Filter active trips
  const activeTrips = trips.filter(trip => 
    trip.status === 'upcoming' || trip.status === 'planning'
  );

  // Get user's current location (simulated)
  useEffect(() => {
    // Simulate getting current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates
          setCurrentLocation("New York, NY");
        },
        () => {
          setCurrentLocation("New York, NY");
        }
      );
    }
  }, []);

  // Auto-fill flight details when trip is selected
  const handleTripSelect = (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      setSelectedTrip(tripId);
      
      // Extract destinations from trip coordinates
      const destinations = trip.coordinates || [];
      
      if (destinations.length > 0) {
        const firstDestination = destinations[0].name;
        const lastDestination = destinations[destinations.length - 1].name;
        
        // Auto-fill form based on trip type
        if (destinations.length === 1) {
          // Single destination trip
          setFormData(prev => ({
            ...prev,
            from: currentLocation,
            to: firstDestination,
            departDate: extractStartDate(trip.dates),
            returnDate: extractEndDate(trip.dates)
          }));
          setTripType('round-trip');
        } else {
          // Multi-destination trip
          setFormData(prev => ({
            ...prev,
            from: currentLocation,
            to: firstDestination,
            departDate: extractStartDate(trip.dates),
            returnDate: extractEndDate(trip.dates)
          }));
          setTripType('round-trip');
        }

        // Show AI automation toast
        toast({
          title: "🤖 AI Auto-filled",
          description: `Flight details populated from "${trip.name}" itinerary`,
        });
      }
    }
  };

  const handleBooking = () => {
    toast({
      title: "Flight booking initiated!",
      description: "Redirecting to booking partner...",
    });
    onClose();
  };

  const steps = [
    { number: 1, title: "Trip Details", icon: Plane },
    { number: 2, title: "Flight Search", icon: Calendar },
    { number: 3, title: "Confirmation", icon: CreditCard }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Plane size={24} />
            <div>
              <h2 className="text-xl font-bold">Book Flight</h2>
              <p className="text-sm opacity-90">AI-powered trip planning</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <FlightBookingSteps steps={steps} activeStep={activeStep} />

        <div className="p-4 space-y-4">
          {/* Step 1: Trip Selection */}
          {activeStep === 1 && (
            <TripSelectionStep
              tripType={tripType}
              setTripType={setTripType}
              selectedTrip={selectedTrip}
              currentLocation={currentLocation}
              activeTrips={activeTrips}
              formData={formData}
              setFormData={setFormData}
              onTripSelect={handleTripSelect}
              onContinue={() => setActiveStep(2)}
            />
          )}

          {/* Step 2: Flight Details */}
          {activeStep === 2 && (
            <FlightDetailsStep
              tripType={tripType}
              formData={formData}
              setFormData={setFormData}
              onBack={() => setActiveStep(1)}
              onContinue={() => setActiveStep(3)}
            />
          )}

          {/* Step 3: Confirmation */}
          {activeStep === 3 && (
            <ConfirmationStep
              tripType={tripType}
              formData={formData}
              selectedTrip={selectedTrip}
              trips={trips}
              onBack={() => setActiveStep(2)}
              onBook={handleBooking}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlightBookingModal;
