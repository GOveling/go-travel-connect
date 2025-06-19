
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TripTypeSelector from "./TripTypeSelector";
import AIRecommendationCard from "./AIRecommendationCard";
import ActiveTripsSelector from "./ActiveTripsSelector";
import { processTripSelection } from "./tripSelectionUtils";

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

interface TripSelectionStepProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  setTripType: (type: 'round-trip' | 'one-way' | 'multi-city') => void;
  selectedTrip: number | null;
  currentLocation: string;
  activeTrips: any[];
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  multiCityFlights: MultiCityFlight[];
  setMultiCityFlights: (flights: MultiCityFlight[] | ((prev: MultiCityFlight[]) => MultiCityFlight[])) => void;
  onTripSelect: (tripId: number) => void;
  onContinue: () => void;
}

const TripSelectionStep = ({
  tripType,
  setTripType,
  selectedTrip,
  currentLocation,
  activeTrips,
  formData,
  setFormData,
  multiCityFlights,
  setMultiCityFlights,
  onTripSelect,
  onContinue
}: TripSelectionStepProps) => {
  const [showAIRecommendation, setShowAIRecommendation] = useState(false);
  const { toast } = useToast();

  const handleTripSelection = (tripId: number) => {
    onTripSelect(tripId);
    const selectedTripData = activeTrips.find(trip => trip.id === tripId);
    
    if (selectedTripData) {
      try {
        const result = processTripSelection(selectedTripData, currentLocation);
        
        setTripType(result.tripType);
        
        if (result.tripType === 'multi-city') {
          setMultiCityFlights(result.multiCityFlights!);
          
          const returnFlightInfo = selectedTripData.dates && selectedTripData.dates.includes(' - ') ? " + vuelo de retorno" : "";
          toast({
            title: "🤖 IA optimizó vuelos multi-destino",
            description: `${result.optimizedFlights.length} vuelos planificados${returnFlightInfo}. ${result.aiRecommendation.reason}`,
          });

          console.log('🤖 AI Flight Optimization Applied:', {
            originalDate: selectedTripData.dates,
            totalFlights: result.optimizedFlights.length,
            hasReturnFlight: returnFlightInfo ? true : false,
            recommendation: result.aiRecommendation
          });
        } else {
          setFormData(result.formData!);
          
          toast({
            title: "🤖 IA optimizó fechas de vuelo",
            description: `${result.aiRecommendation.reason} Distancia: ${result.aiRecommendation.distance}km`,
          });

          console.log('🤖 AI Flight Optimization Applied:', {
            originalDate: selectedTripData.dates,
            totalFlights: 1,
            hasReturnFlight: result.formData!.returnDate ? true : false,
            recommendation: result.aiRecommendation
          });
        }
        
        setShowAIRecommendation(true);
      } catch (error) {
        console.error('Error processing trip selection:', error);
        toast({
          title: "⚠️ No se encontraron destinos",
          description: "El viaje seleccionado no tiene destinos configurados.",
        });
      }
    }
  };

  const canContinue = () => {
    if (selectedTrip === null) return false;
    
    if (tripType === 'multi-city') {
      return multiCityFlights.length >= 2;
    }
    
    return formData.from && formData.to && formData.departDate;
  };

  return (
    <div className="space-y-4">
      <TripTypeSelector tripType={tripType} setTripType={setTripType} />

      {showAIRecommendation && (
        <AIRecommendationCard tripType={tripType} multiCityFlights={multiCityFlights} />
      )}

      <ActiveTripsSelector 
        activeTrips={activeTrips}
        selectedTrip={selectedTrip}
        onTripSelect={handleTripSelection}
      />

      <Button 
        onClick={onContinue}
        className="w-full"
        disabled={!canContinue()}
      >
        <Plane size={16} className="mr-2" />
        Continue to Flight Details
      </Button>
    </div>
  );
};

export default TripSelectionStep;
