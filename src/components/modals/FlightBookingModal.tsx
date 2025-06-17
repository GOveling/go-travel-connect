
import { useState, useEffect } from "react";
import { Plane, Calendar, CreditCard, X, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHomeState } from "@/hooks/useHomeState";
import { useToast } from "@/hooks/use-toast";
import FlightBookingSteps from "./flight-booking/FlightBookingSteps";
import TripSelectionStep from "./flight-booking/TripSelectionStep";
import FlightDetailsStep from "./flight-booking/FlightDetailsStep";
import ConfirmationStep from "./flight-booking/ConfirmationStep";
import FlightOptionsView from "./flight-booking/FlightOptionsView";
import MyFlightsView from "./flight-booking/MyFlightsView";
import AddFlightView from "./flight-booking/AddFlightView";
import { extractStartDate, extractEndDate } from "./flight-booking/flightBookingUtils";
import { 
  getAIFlightTimingRecommendation, 
  adjustFlightDateBasedOnAI,
  type FlightTimingRecommendation 
} from "./flight-booking/aiFlightTimingUtils";

interface FlightBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlightBookingModal = ({ isOpen, onClose }: FlightBookingModalProps) => {
  const [currentView, setCurrentView] = useState<'options' | 'my-flights' | 'add-flight' | 'booking'>('options');
  const [activeStep, setActiveStep] = useState(1);
  const [tripType, setTripType] = useState<'round-trip' | 'one-way' | 'multi-city'>('round-trip');
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState("New York, NY");
  const [aiRecommendation, setAiRecommendation] = useState<FlightTimingRecommendation | null>(null);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy'
  });

  // New state for multi-city flights
  const [multiCityFlights, setMultiCityFlights] = useState([
    {
      from: '',
      to: '',
      departDate: '',
      passengers: 1,
      class: 'economy'
    },
    {
      from: '',
      to: '',
      departDate: '',
      passengers: 1,
      class: 'economy'
    }
  ]);

  const { trips } = useHomeState();
  const { toast } = useToast();

  // Filter active trips
  const activeTrips = trips.filter(trip => 
    trip.status === 'upcoming' || trip.status === 'planning'
  );

  // Reset to options view when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView('options');
      setActiveStep(1);
    }
  }, [isOpen]);

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
      
      if (destinations.length > 1) {
        // Multi-destination trip - book two separate one-way flights
        const firstDestination = destinations[0].name;
        const lastDestination = destinations[destinations.length - 1].name;
        const startDate = extractStartDate(trip.dates);
        const endDate = extractEndDate(trip.dates);
        
        console.log('Trip dates:', trip.dates);
        console.log('Extracted start date:', startDate);
        console.log('Extracted end date:', endDate);
        console.log('First destination:', firstDestination);
        console.log('Last destination:', lastDestination);
        
        // 🤖 AI Protocol: Get flight timing recommendation for first flight
        const aiRec = getAIFlightTimingRecommendation(
          currentLocation,
          firstDestination,
          startDate
        );
        setAiRecommendation(aiRec);
        
        // Adjust flight date based on AI recommendation
        const optimizedDepartDate = adjustFlightDateBasedOnAI(startDate, aiRec);
        
        const newMultiCityFlights = [
          {
            from: currentLocation,
            to: firstDestination,
            departDate: optimizedDepartDate,
            passengers: 1,
            class: 'economy'
          },
          {
            from: lastDestination,
            to: currentLocation,
            departDate: endDate,
            passengers: 1,
            class: 'economy'
          }
        ];
        
        console.log('🤖 AI optimized multi-city flights:', newMultiCityFlights);
        
        setTripType('multi-city');
        setMultiCityFlights(newMultiCityFlights);

        // Show AI automation toast for multi-city
        toast({
          title: "🤖 IA optimizó vuelos multi-ciudad",
          description: `${aiRec.reason} Distancia: ${aiRec.distance}km. Vuelo ${optimizedDepartDate !== startDate ? 'un día antes' : 'el mismo día'}.`,
        });
      } else if (destinations.length === 1) {
        // Single destination trip - round trip
        const firstDestination = destinations[0].name;
        const startDate = extractStartDate(trip.dates);
        
        // 🤖 AI Protocol: Get flight timing recommendation
        const aiRec = getAIFlightTimingRecommendation(
          currentLocation,
          firstDestination,
          startDate
        );
        setAiRecommendation(aiRec);
        
        // Adjust flight date based on AI recommendation
        const optimizedDepartDate = adjustFlightDateBasedOnAI(startDate, aiRec);
        
        setFormData(prev => ({
          ...prev,
          from: currentLocation,
          to: firstDestination,
          departDate: optimizedDepartDate,
          returnDate: extractEndDate(trip.dates)
        }));
        setTripType('round-trip');

        // Show AI automation toast
        toast({
          title: "🤖 IA optimizó horarios de vuelo",
          description: `${aiRec.reason} Distancia: ${aiRec.distance}km. Confianza: ${aiRec.aiConfidence}.`,
        });
      }
    }
  };

  const handleBooking = () => {
    if (tripType === 'multi-city') {
      toast({
        title: "Multi-city flights booking initiated!",
        description: "Redirecting to booking partner for two one-way flights...",
      });
    } else {
      toast({
        title: "Flight booking initiated!",
        description: "Redirecting to booking partner...",
      });
    }
    onClose();
  };

  const steps = [
    { number: 1, title: "Trip Details", icon: Plane },
    { number: 2, title: "Flight Search", icon: Calendar },
    { number: 3, title: "Confirmation", icon: CreditCard }
  ];

  const getModalTitle = () => {
    if (currentView === 'my-flights') return 'My Flights';
    if (currentView === 'add-flight') return 'Add Flight';
    if (currentView === 'booking') return 'Book Flight';
    return 'Flight Services';
  };

  const showBackButton = () => {
    return currentView === 'booking';
  };

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
          {showBackButton() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('options')}
              className="absolute left-2 top-2 text-white hover:bg-white/20 bg-white/10 border border-white/30 px-3 h-8"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span className="text-sm font-medium">Back</span>
            </Button>
          )}
          <div className="flex items-center space-x-3 pt-2">
            <Plane size={24} />
            <div>
              <h2 className="text-xl font-bold">{getModalTitle()}</h2>
              <p className="text-sm opacity-90">AI-powered trip planning</p>
            </div>
          </div>
        </div>

        {/* AI Recommendation Display */}
        {currentView === 'booking' && aiRecommendation && (
          <div className="px-4 pt-2">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">🧠</span>
                <span className="text-sm font-semibold text-purple-800">Recomendación IA</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  aiRecommendation.aiConfidence === 'high' ? 'bg-green-100 text-green-800' :
                  aiRecommendation.aiConfidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {aiRecommendation.aiConfidence}
                </span>
              </div>
              <p className="text-xs text-purple-700 mb-1">{aiRecommendation.reason}</p>
              <div className="flex justify-between text-xs text-purple-600">
                <span>Distancia: {aiRecommendation.distance}km</span>
                <span>Duración: {aiRecommendation.estimatedFlightDuration}</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps - only show for booking flow */}
        {currentView === 'booking' && (
          <FlightBookingSteps steps={steps} activeStep={activeStep} />
        )}

        <div className="p-4 space-y-4">
          {/* Options View */}
          {currentView === 'options' && (
            <FlightOptionsView
              onSelectMyFlights={() => setCurrentView('my-flights')}
              onSelectBookFlight={() => setCurrentView('booking')}
            />
          )}

          {/* My Flights View */}
          {currentView === 'my-flights' && (
            <MyFlightsView
              onBackToOptions={() => setCurrentView('options')}
              onAddFlight={() => setCurrentView('add-flight')}
            />
          )}

          {/* Add Flight View */}
          {currentView === 'add-flight' && (
            <AddFlightView
              onBackToMyFlights={() => setCurrentView('my-flights')}
            />
          )}

          {/* Booking Flow */}
          {currentView === 'booking' && (
            <>
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
                  multiCityFlights={multiCityFlights}
                  setMultiCityFlights={setMultiCityFlights}
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
                  multiCityFlights={multiCityFlights}
                  setMultiCityFlights={setMultiCityFlights}
                  onBack={() => setActiveStep(1)}
                  onContinue={() => setActiveStep(3)}
                />
              )}

              {/* Step 3: Confirmation */}
              {activeStep === 3 && (
                <ConfirmationStep
                  tripType={tripType}
                  formData={formData}
                  multiCityFlights={multiCityFlights}
                  selectedTrip={selectedTrip}
                  trips={trips}
                  onBack={() => setActiveStep(2)}
                  onBook={handleBooking}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlightBookingModal;
