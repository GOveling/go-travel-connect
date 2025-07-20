import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import FlightSummary from "./FlightSummary";
import FlightSearchAnimation from "./FlightSearchAnimation";

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

interface FlightBookingSummaryStepProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city' | 'manual';
  formData: FormData;
  multiCityFlights: MultiCityFlight[];
  onComplete: () => void;
  onReset: () => void;
  isSearching?: boolean;
}

const FlightBookingSummaryStep = ({
  tripType,
  formData,
  multiCityFlights,
  onComplete,
  onReset,
  isSearching = false
}: FlightBookingSummaryStepProps) => {
  
  // Show loading animation when searching
  if (isSearching) {
    return (
      <div className="p-4">
        <FlightSearchAnimation 
          origin={formData.from || 'Origen'}
          destination={formData.to || 'Destino'}
        />
      </div>
    );
  }

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
          disabled={isSearching}
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
};

export default FlightBookingSummaryStep;
