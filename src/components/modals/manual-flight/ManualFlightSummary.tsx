import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Plane } from "lucide-react";
import { format } from "date-fns";

interface ManualFlightData {
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

interface ManualFlightSummaryProps {
  flightType: "round-trip" | "one-way" | "multi-city";
  flightData: ManualFlightData;
  multiCityFlights: MultiCityFlight[];
}

const ManualFlightSummary = ({
  flightType,
  flightData,
  multiCityFlights,
}: ManualFlightSummaryProps) => {
  const getClassLabel = (classValue: string) => {
    const classLabels = {
      economy: "Económica",
      premium: "Premium",
      business: "Business",
      first: "Primera",
    };
    return classLabels[classValue as keyof typeof classLabels] || classValue;
  };

  if (flightType === "multi-city") {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">
          Resumen de Vuelos Multi-destino
        </h3>

        {multiCityFlights.map((flight, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  Vuelo {index + 1}
                </Badge>
                <Plane size={16} className="text-gray-400" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="font-medium">{flight.from}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium">{flight.to}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  <span>
                    {format(new Date(flight.departDate), "dd/MM/yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users size={14} className="text-gray-400" />
                    <span>
                      {flight.passengers} pasajero
                      {flight.passengers > 1 ? "s" : ""}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getClassLabel(flight.class)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Resumen del Vuelo</h3>

      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge
              variant="outline"
              className={`${
                flightType === "round-trip"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {flightType === "round-trip" ? "Ida y Vuelta" : "Solo Ida"}
            </Badge>
            <Plane size={16} className="text-gray-400" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin size={14} className="text-gray-400" />
              <span className="font-medium">{flightData.from}</span>
              <span className="text-gray-400">→</span>
              <span className="font-medium">{flightData.to}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={14} className="text-gray-400" />
                <div className="flex flex-col">
                  <span>
                    Salida:{" "}
                    {format(new Date(flightData.departDate), "dd/MM/yyyy")}
                  </span>
                  {flightType === "round-trip" && flightData.returnDate && (
                    <span>
                      Regreso:{" "}
                      {format(new Date(flightData.returnDate), "dd/MM/yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users size={14} className="text-gray-400" />
                <span>
                  {flightData.passengers} pasajero
                  {flightData.passengers > 1 ? "s" : ""}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {getClassLabel(flightData.class)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualFlightSummary;
