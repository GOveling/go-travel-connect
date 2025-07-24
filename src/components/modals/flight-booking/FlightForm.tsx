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

interface FlightFormProps {
  tripType: "round-trip" | "one-way" | "multi-city" | "manual";
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  multiCityFlights: MultiCityFlight[];
  setMultiCityFlights: (
    flights:
      | MultiCityFlight[]
      | ((prev: MultiCityFlight[]) => MultiCityFlight[])
  ) => void;
  isDateRangeOpen: boolean;
  setIsDateRangeOpen: (open: boolean) => void;
  isDepartDateOpen: boolean;
  setIsDepartDateOpen: (open: boolean) => void;
}

const FlightForm = ({
  tripType,
  formData,
  setFormData,
  multiCityFlights,
  setMultiCityFlights,
  isDateRangeOpen,
  setIsDateRangeOpen,
  isDepartDateOpen,
  setIsDepartDateOpen,
}: FlightFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Detalles del Vuelo</h3>

      {tripType === "multi-city" ? (
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
    </div>
  );
};

export default FlightForm;
