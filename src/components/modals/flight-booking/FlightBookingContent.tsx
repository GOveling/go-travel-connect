import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Plane, ArrowLeft, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FlightTypeSelector from "./FlightTypeSelector";
import TripSelector from "./TripSelector";
import FlightForm from "./FlightForm";
import AIRecommendationBanner from "./AIRecommendationBanner";
import FlightSummary from "./FlightSummary";
import ManualFlightModal from "../ManualFlightModal";
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

interface FlightBookingContentProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city' | 'manual';
  setTripType: (type: 'round-trip' | 'one-way' | 'multi-city' | 'manual') => void;
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  multiCityFlights: MultiCityFlight[];
  setMultiCityFlights: (flights: MultiCityFlight[] | ((prev: MultiCityFlight[]) => MultiCityFlight[])) => void;
  selectedTrip: number | null;
  handleTripSelection: (tripId: number) => void;
  trips: any[];
  isDateRangeOpen: boolean;
  setIsDateRangeOpen: (open: boolean) => void;
  isDepartDateOpen: boolean;
  setIsDepartDateOpen: (open: boolean) => void;
  showAIRecommendation: boolean;
  setShowAIRecommendation: (show: boolean) => void;
  onComplete: () => void;
  onClose: () => void;
  onReset: () => void;
}

const FlightBookingContent = ({
  tripType,
  setTripType,
  formData,
  setFormData,
  multiCityFlights,
  setMultiCityFlights,
  selectedTrip,
  handleTripSelection,
  trips,
  isDateRangeOpen,
  setIsDateRangeOpen,
  isDepartDateOpen,
  setIsDepartDateOpen,
  showAIRecommendation,
  setShowAIRecommendation,
  onComplete,
  onClose,
  onReset
}: FlightBookingContentProps) => {
  const [currentStep, setCurrentStep] = useState<'type' | 'details' | 'summary'>('type');
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

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center space-x-3">
        {currentStep !== 'type' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (currentStep === 'summary') setCurrentStep('details');
              else if (currentStep === 'details') setCurrentStep('type');
            }}
          >
            <ArrowLeft size={16} />
          </Button>
        )}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Plane size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Buscar Vuelos</h2>
            <p className="text-xs text-gray-500">
              {currentStep === 'type' && 'Selecciona tipo de viaje'}
              {currentStep === 'details' && 'Completa los detalles'}
              {currentStep === 'summary' && 'Confirma tu búsqueda'}
            </p>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X size={16} />
      </Button>
    </div>
  );

  const renderProgress = () => (
    <div className="px-4 py-2 bg-gray-50">
      <div className="flex items-center justify-center space-x-2">
        {['type', 'details', 'summary'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${
              currentStep === step ? 'bg-blue-500' : 
              ['type', 'details', 'summary'].indexOf(currentStep) > index ? 'bg-blue-300' : 'bg-gray-300'
            }`} />
            {index < 2 && <div className="w-6 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <div className="p-4 space-y-4">
            <FlightTypeSelector 
              tripType={tripType} 
              onTypeChange={handleTripTypeChange}
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
                onTripSelect={handleTripSelect}
              />
            )}
            
            {tripType !== 'manual' && (
              <Button 
                onClick={() => setCurrentStep('details')}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                disabled={!canProceedToDetails()}
              >
                <Plane size={16} className="mr-2" />
                Continuar
              </Button>
            )}
          </div>
        );
        
      case 'details':
        return (
          <div className="p-4 space-y-4">
            <FlightForm
              tripType={tripType}
              formData={formData}
              setFormData={setFormData}
              multiCityFlights={multiCityFlights}
              setMultiCityFlights={setMultiCityFlights}
              isDateRangeOpen={isDateRangeOpen}
              setIsDateRangeOpen={setIsDateRangeOpen}
              isDepartDateOpen={isDepartDateOpen}
              setIsDepartDateOpen={setIsDepartDateOpen}
            />
            
            <Button 
              onClick={() => setCurrentStep('summary')}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
              disabled={!canProceedToSummary()}
            >
              Revisar Vuelo
            </Button>
          </div>
        );
        
      case 'summary':
        return (
          <div className="p-4 space-y-4">
            <FlightSummary
              tripType={tripType}
              formData={formData}
              multiCityFlights={multiCityFlights}
            />
            
            <div className="space-y-2">
              <Button 
                onClick={onComplete}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium"
              >
                <Search size={16} className="mr-2" />
                Buscar Vuelos
              </Button>
              <Button 
                variant="outline"
                onClick={onReset}
                className="w-full"
              >
                Nueva Búsqueda
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <div className="h-full max-h-[95vh] flex flex-col">
        {renderHeader()}
        {renderProgress()}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
      
      <ManualFlightModal
        isOpen={isManualFlightModalOpen}
        onClose={() => {
          setIsManualFlightModalOpen(false);
          setTripType('round-trip'); // Reset to default when closing manual modal
        }}
      />
    </>
  );
};

export default FlightBookingContent;
