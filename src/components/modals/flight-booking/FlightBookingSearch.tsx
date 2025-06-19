import { Button } from "@/components/ui/button";
import FlightBookingSteps from "./FlightBookingSteps";
import TripSelectionStep from "./TripSelectionStep";
import FlightDetailsStep from "./FlightDetailsStep";
import ConfirmationStep from "./ConfirmationStep";
import { MapPin, Plane, Calendar } from "lucide-react";

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

interface FlightBookingSearchProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  setTripType: (type: 'round-trip' | 'one-way' | 'multi-city') => void;
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
  onComplete: () => void;
}

const FlightBookingSearch = ({
  currentStep,
  setCurrentStep,
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
  onComplete
}: FlightBookingSearchProps) => {
  const bookingSteps = [
    { number: 1, title: "Select Trip", icon: MapPin },
    { number: 2, title: "Flight Details", icon: Plane },
    { number: 3, title: "Confirmation", icon: Calendar }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TripSelectionStep 
            tripType={tripType}
            setTripType={setTripType}
            selectedTrip={selectedTrip}
            currentLocation="New York, NY"
            activeTrips={trips}
            formData={formData}
            setFormData={setFormData}
            multiCityFlights={multiCityFlights}
            setMultiCityFlights={setMultiCityFlights}
            onTripSelect={handleTripSelection}
            onContinue={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <FlightDetailsStep
            tripType={tripType}
            formData={formData}
            setFormData={setFormData}
            multiCityFlights={multiCityFlights}
            setMultiCityFlights={setMultiCityFlights}
            isDateRangeOpen={isDateRangeOpen}
            setIsDateRangeOpen={setIsDateRangeOpen}
            isDepartDateOpen={isDepartDateOpen}
            setIsDepartDateOpen={setIsDepartDateOpen}
            onBack={() => setCurrentStep(1)}
            onContinue={() => setCurrentStep(3)}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            tripType={tripType}
            formData={formData}
            multiCityFlights={multiCityFlights}
            onBack={() => setCurrentStep(2)}
            onComplete={onComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <FlightBookingSteps steps={bookingSteps} activeStep={currentStep} />
      {renderStepContent()}
    </div>
  );
};

export default FlightBookingSearch;
