
import { Button } from "@/components/ui/button";
import FlightForm from "./FlightForm";

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

interface FlightBookingDetailsStepProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city' | 'manual';
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  multiCityFlights: MultiCityFlight[];
  setMultiCityFlights: (flights: MultiCityFlight[] | ((prev: MultiCityFlight[]) => MultiCityFlight[])) => void;
  isDateRangeOpen: boolean;
  setIsDateRangeOpen: (open: boolean) => void;
  isDepartDateOpen: boolean;
  setIsDepartDateOpen: (open: boolean) => void;
  canProceed: boolean;
  onContinue: () => void;
}

const FlightBookingDetailsStep = ({
  tripType,
  formData,
  setFormData,
  multiCityFlights,
  setMultiCityFlights,
  isDateRangeOpen,
  setIsDateRangeOpen,
  isDepartDateOpen,
  setIsDepartDateOpen,
  canProceed,
  onContinue
}: FlightBookingDetailsStepProps) => {
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
        onClick={onContinue}
        className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
        disabled={!canProceed}
      >
        Revisar Vuelo
      </Button>
    </div>
  );
};

export default FlightBookingDetailsStep;
