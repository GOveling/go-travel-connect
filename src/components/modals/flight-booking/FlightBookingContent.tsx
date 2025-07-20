import { useState } from "react";
import FlightBookingHeader from "./FlightBookingHeader";
import FlightBookingProgress from "./FlightBookingProgress";
import FlightBookingTypeStep from "./FlightBookingTypeStep";
import FlightBookingDetailsStep from "./FlightBookingDetailsStep";
import FlightBookingSummaryStep from "./FlightBookingSummaryStep";
import FlightResultsStep from "./FlightResultsStep";
import ManualFlightModal from "../ManualFlightModal";
import { useFlightBookingLogic } from "./useFlightBookingLogic";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface FlightResult {
  price: number;
  airline: string;
  departure_at: string;
  return_at?: string;
  duration?: number;
  transfers: number;
  link: string;
  origin: string;
  destination: string;
  found_at: string;
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
  const [flightResults, setFlightResults] = useState<FlightResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>("");
  const [resultsCurrency, setResultsCurrency] = useState("USD");

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

  const searchFlights = async () => {
    setIsSearching(true);
    setSearchError("");
    
    try {
      console.log('🔍 Searching flights with:', formData);
      
      const searchRequest = {
        origin: formData.from.split(',')[0].trim(), // Extract city/airport code
        destination: formData.to.split(',')[0].trim(),
        departure_date: formData.departDate,
        return_date: tripType === 'round-trip' ? formData.returnDate : undefined,
        currency: 'USD',
        limit: 30
      };

      const { data, error } = await supabase.functions.invoke('aviasales-flights/search', {
        body: searchRequest
      });

      if (error) {
        console.error('❌ Flight search error:', error);
        throw new Error(error.message || 'Failed to search flights');
      }

      if (!data.success) {
        throw new Error(data.error || 'Search was not successful');
      }

      console.log('✅ Flight search results:', data);
      setFlightResults(data.data || []);
      setResultsCurrency(data.currency || 'USD');
      setCurrentStep('results'); // Move to results step
      
    } catch (error: any) {
      console.error('❌ Flight search failed:', error);
      setSearchError(error.message || 'Failed to search flights. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSummaryComplete = () => {
    searchFlights();
  };

  const handleNewSearch = () => {
    setCurrentStep('type');
    setFlightResults([]);
    setSearchError("");
  };

  const handleManualFlightModalClose = () => {
    setIsManualFlightModalOpen(false);
    setTripType('round-trip');
  };

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
            onComplete={handleSummaryComplete}
            onReset={onReset}
            isSearching={isSearching}
          />
        );

      case 'results':
        return (
          <FlightResultsStep
            results={flightResults}
            currency={resultsCurrency}
            isLoading={isSearching}
            error={searchError}
            onBack={() => setCurrentStep('summary')}
            onNewSearch={handleNewSearch}
            searchParams={{
              from: formData.from,
              to: formData.to,
              departDate: formData.departDate,
              returnDate: tripType === 'round-trip' ? formData.returnDate : undefined,
              passengers: formData.passengers
            }}
          />
        );
        
      default:
        return null;
    }
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