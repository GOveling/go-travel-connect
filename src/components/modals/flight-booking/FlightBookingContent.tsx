
import FlightBookingHeader from "./FlightBookingHeader";
import FlightBookingProgress from "./FlightBookingProgress";
import FlightBookingTypeStep from "./FlightBookingTypeStep";
import FlightBookingDetailsStep from "./FlightBookingDetailsStep";
import FlightBookingSummaryStep from "./FlightBookingSummaryStep";
import ManualFlightModal from "../ManualFlightModal";
import { useFlightBookingLogic } from "./useFlightBookingLogic";

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
  const {
    currentStep,
    setCurrentStep,
    isManualFlightModalOpen,
    setIsManualFlightModalOpen,
    handleTripTypeChange,
    handleTripSelect,
    handleStepBack,
    canProceedToDetails,
    canProceedToSummary
  } = useFlightBookingLogic({
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
  });

  const renderContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <FlightBookingTypeStep
            tripType={tripType}
            onTypeChange={handleTripTypeChange}
            showAIRecommendation={Boolean(showAIRecommendation)}
            multiCityFlights={multiCityFlights}
            trips={trips}
            selectedTrip={selectedTrip}
            onTripSelect={handleTripSelect}
            canProceed={Boolean(canProceedToDetails())}
            onContinue={() => setCurrentStep('details')}
          />
        );
        
      case 'details':
        return (
          <FlightBookingDetailsStep
            tripType={tripType}
            formData={formData}
            setFormData={setFormData}
            multiCityFlights={multiCityFlights}
            setMultiCityFlights={setMultiCityFlights}
            isDateRangeOpen={Boolean(isDateRangeOpen)}
            setIsDateRangeOpen={setIsDateRangeOpen}
            isDepartDateOpen={Boolean(isDepartDateOpen)}
            setIsDepartDateOpen={setIsDepartDateOpen}
            canProceed={Boolean(canProceedToSummary())}
            onContinue={() => setCurrentStep('summary')}
          />
        );
        
      case 'summary':
        return (
          <FlightBookingSummaryStep
            tripType={tripType}
            formData={formData}
            multiCityFlights={multiCityFlights}
            onComplete={onComplete}
            onReset={onReset}
          />
        );
        
      default:
        return null;
    }
  };

  const handleManualFlightModalClose = () => {
    setIsManualFlightModalOpen(false);
    setTripType('round-trip');
  };

  return (
    <>
      <div className="h-full max-h-[95vh] flex flex-col">
        <FlightBookingHeader 
          currentStep={currentStep}
          onStepBack={handleStepBack}
        />
        <FlightBookingProgress currentStep={currentStep} />
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
      
      <ManualFlightModal
        isOpen={Boolean(isManualFlightModalOpen)}
        onClose={handleManualFlightModalClose}
      />
    </>
  );
};

export default FlightBookingContent;
