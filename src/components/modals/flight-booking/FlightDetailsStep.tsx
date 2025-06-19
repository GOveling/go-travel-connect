
import { Button } from "@/components/ui/button";
import MultiCityFlightForm from "./MultiCityFlightForm";
import RegularFlightForm from "./RegularFlightForm";

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

interface FlightDetailsStepProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  multiCityFlights: MultiCityFlight[];
  setMultiCityFlights: (flights: MultiCityFlight[] | ((prev: MultiCityFlight[]) => MultiCityFlight[])) => void;
  isDateRangeOpen: boolean;
  setIsDateRangeOpen: (open: boolean) => void;
  isDepartDateOpen: boolean;
  setIsDepartDateOpen: (open: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}

const FlightDetailsStep = ({
  tripType,
  formData,
  setFormData,
  multiCityFlights,
  setMultiCityFlights,
  isDateRangeOpen,
  setIsDateRangeOpen,
  isDepartDateOpen,
  setIsDepartDateOpen,
  onBack,
  onContinue
}: FlightDetailsStepProps) => {
  console.log('FlightDetailsStep - multiCityFlights:', multiCityFlights);
  console.log('FlightDetailsStep - tripType:', tripType);

  const canContinue = () => {
    if (tripType === 'multi-city') {
      return multiCityFlights.length >= 2 && 
             multiCityFlights.every(flight => flight.from && flight.to && flight.departDate);
    }
    return formData.from && formData.to && formData.departDate && (tripType === 'one-way' || formData.returnDate);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Flight Details</h3>
      
      {tripType === 'multi-city' ? (
        <MultiCityFlightForm
          multiCityFlights={multiCityFlights}
          setMultiCityFlights={setMultiCityFlights}
        />
      ) : (
        <RegularFlightForm
          tripType={tripType}
          formData={formData}
          setFormData={setFormData}
          isDateRangeOpen={isDateRangeOpen}
          setIsDateRangeOpen={setIsDateRangeOpen}
          isDepartDateOpen={isDepartDateOpen}
          setIsDepartDateOpen={setIsDepartDateOpen}
        />
      )}

      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 h-12"
        >
          Back
        </Button>
        <Button 
          onClick={onContinue}
          className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600"
          disabled={!canContinue()}
        >
          Review
        </Button>
      </div>
    </div>
  );
};

export default FlightDetailsStep;
