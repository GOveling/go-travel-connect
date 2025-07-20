
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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

interface UseFlightBookingLogicProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city' | 'manual';
  setTripType: (type: 'round-trip' | 'one-way' | 'multi-city' | 'manual') => void;
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  multiCityFlights: MultiCityFlight[];
  setMultiCityFlights: (flights: MultiCityFlight[] | ((prev: MultiCityFlight[]) => MultiCityFlight[])) => void;
  selectedTrip: number | null;
  handleTripSelection: (tripId: number) => void;
  trips: any[];
  setShowAIRecommendation: (show: boolean) => void;
}

export const useFlightBookingLogic = ({
  tripType,
  setTripType,
  formData,
  setFormData,
  multiCityFlights,
  setMultiCityFlights,
  selectedTrip,
  handleTripSelection,
  trips,
  setShowAIRecommendation
}: UseFlightBookingLogicProps) => {
  const [currentStep, setCurrentStep] = useState<'type' | 'details' | 'summary' | 'results'>('type');
  const [isManualFlightModalOpen, setIsManualFlightModalOpen] = useState(false);
  const { toast } = useToast();

  const handleTripTypeChange = (type: 'round-trip' | 'one-way' | 'multi-city' | 'manual') => {
    setTripType(type);
    setShowAIRecommendation(false);
    if (type === 'manual') {
      setIsManualFlightModalOpen(true);
    } else {
      setCurrentStep('type');
    }
  };

  const handleTripSelect = (tripId: number) => {
    handleTripSelection(tripId);
    const selectedTripData = trips.find(trip => trip.id === tripId);
    
    if (selectedTripData) {
      try {
        const result = processTripSelection(selectedTripData, "New York, NY");
        
        setTripType(result.tripType);
        
        if (result.tripType === 'multi-city') {
          setMultiCityFlights(result.multiCityFlights!);
          
          const returnFlightInfo = selectedTripData.dates && selectedTripData.dates.includes(' - ') ? " + vuelo de retorno" : "";
          toast({
            title: "🤖 IA optimizó vuelos multi-destino",
            description: `${result.optimizedFlights.length} vuelos planificados${returnFlightInfo}. ${result.aiRecommendation.reason}`,
          });
        } else {
          setFormData(result.formData!);
          
          toast({
            title: "🤖 IA optimizó fechas de vuelo",
            description: `${result.aiRecommendation.reason} Distancia: ${result.aiRecommendation.distance}km`,
          });
        }
        
        setShowAIRecommendation(true);
        setCurrentStep('details');
      } catch (error) {
        console.error('Error processing trip selection:', error);
        toast({
          title: "⚠️ No se encontraron destinos",
          description: "El viaje seleccionado no tiene destinos configurados.",
        });
      }
    }
  };

  const handleStepBack = () => {
    if (currentStep === 'results') setCurrentStep('summary');
    else if (currentStep === 'summary') setCurrentStep('details');
    else if (currentStep === 'details') setCurrentStep('type');
  };

  const canProceedToDetails = () => {
    if (tripType === 'manual') return true;
    return selectedTrip !== null;
  };

  const canProceedToSummary = () => {
    if (tripType === 'multi-city') {
      return multiCityFlights.length >= 2 && 
             multiCityFlights.every(flight => flight.from && flight.to && flight.departDate);
    }
    return formData.from && formData.to && formData.departDate && 
           (tripType === 'one-way' || tripType === 'manual' || formData.returnDate);
  };

  return {
    currentStep,
    setCurrentStep,
    isManualFlightModalOpen,
    setIsManualFlightModalOpen,
    handleTripTypeChange,
    handleTripSelect,
    handleStepBack,
    canProceedToDetails,
    canProceedToSummary
  };
};
