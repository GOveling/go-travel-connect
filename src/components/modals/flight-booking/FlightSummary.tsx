import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar, Users, MapPin, ArrowRight } from "lucide-react";

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

interface FlightSummaryProps {
  tripType: "round-trip" | "one-way" | "multi-city" | "manual";
  formData: FormData;
  multiCityFlights: MultiCityFlight[];
}

const FlightSummary = ({
  tripType,
  formData,
  multiCityFlights,
}: FlightSummaryProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTripTypeLabel = () => {
    switch (tripType) {
      case "round-trip":
        return "Ida y Vuelta";
      case "one-way":
        return "Solo Ida";
      case "multi-city":
        return "Multi-destino";
      case "manual":
        return "Manual";
      default:
        return tripType;
    }
  };

  const renderMultiCityFlights = () => (
    <div className="space-y-3">
      {multiCityFlights.map((flight, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              Vuelo {index + 1}
            </Badge>
            <div className="text-xs text-gray-500">
              {flight.passengers} pasajero{flight.passengers > 1 ? "s" : ""} •{" "}
              {flight.class}
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium">{flight.from}</span>
            <ArrowRight size={14} className="text-gray-400" />
            <span className="font-medium">{flight.to}</span>
          </div>
          <div className="flex items-center space-x-1 mt-1 text-xs text-gray-600">
            <Calendar size={12} />
            <span>{formatDate(flight.departDate)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRegularFlight = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-blue-500" />
            <span className="font-medium text-sm">Ruta</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium">{formData.from}</span>
            <ArrowRight size={14} className="text-gray-400" />
            <span className="font-medium">{formData.to}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar size={14} className="text-blue-500" />
            <div>
              <div className="font-medium">Salida</div>
              <div className="text-xs text-gray-600">
                {formatDate(formData.departDate)}
              </div>
            </div>
          </div>

          {(tripType === "round-trip" ||
            (tripType === "manual" && formData.returnDate)) && (
            <div className="flex items-center space-x-2">
              <Calendar size={14} className="text-blue-500" />
              <div>
                <div className="font-medium">Regreso</div>
                <div className="text-xs text-gray-600">
                  {formatDate(formData.returnDate)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Users size={14} className="text-blue-500" />
            <span className="font-medium text-sm">Pasajeros</span>
          </div>
          <span className="text-sm text-gray-600">
            {formData.passengers} pasajero{formData.passengers > 1 ? "s" : ""}
          </span>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Plane size={14} className="text-blue-500" />
            <span className="font-medium text-sm">Clase</span>
          </div>
          <span className="text-sm text-gray-600 capitalize">
            {formData.class}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Resumen del Vuelo</h3>
        <Badge variant="outline" className="capitalize">
          {getTripTypeLabel()}
        </Badge>
      </div>

      <Card className="border-2 border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Plane size={18} className="text-blue-500" />
            <span>Detalles del Vuelo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {tripType === "multi-city"
            ? renderMultiCityFlights()
            : renderRegularFlight()}
        </CardContent>
      </Card>
    </div>
  );
};

export default FlightSummary;
