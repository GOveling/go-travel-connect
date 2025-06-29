
import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";
import FlightTypeSelector from "./FlightTypeSelector";
import TripSelector from "./TripSelector";
import AIRecommendationBanner from "./AIRecommendationBanner";

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface MultiCityFlight {
  from: string;
  to: string;
  departDate: string;
  passengers: number;
  class: string;
}

interface FlightBookingTypeStepProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city' | 'manual';
  onTypeChange: (type: 'round-trip' | 'one-way' | 'multi-city' | 'manual') => void;
  showAIRecommendation: boolean;
  multiCityFlights: MultiCityFlight[];
  trips: any[];
  selectedTrip: number | null;
  onTripSelect: (tripId: number) => void;
  canProceed: boolean;
  onContinue: () => void;
}

const FlightBookingTypeStep = ({
  tripType,
  onTypeChange,
  showAIRecommendation,
  multiCityFlights,
  trips,
  selectedTrip,
  onTripSelect,
  canProceed,
  onContinue
}: FlightBookingTypeStepProps) => {
  return (
    <div className="p-4 space-y-4">
      <FlightTypeSelector 
        tripType={tripType} 
        onTypeChange={onTypeChange}
      />
      
      {showAIRecommendation && (
        <AIRecommendationBanner 
          tripType={tripType} 
          multiCityFlights={multiCityFlights}
        />
      )}
      
      {tripType !== 'manual' && (
        <TripSelector
          trips={trips}
          selectedTrip={selectedTrip}
          onTripSelect={onTripSelect}
        />
      )}
      
      {tripType !== 'manual' && (
        <Button 
          onClick={onContinue}
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
          disabled={!canProceed}
        >
          <Plane size={16} className="mr-2" />
          Continuar
        </Button>
      )}
    </div>
  );
};

export default FlightBookingTypeStep;
