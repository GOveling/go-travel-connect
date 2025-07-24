import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Check } from "lucide-react";

interface TripSelectorProps {
  trips: any[];
  selectedTrip: number | null;
  onTripSelect: (tripId: number) => void;
}

const TripSelector = ({
  trips,
  selectedTrip,
  onTripSelect,
}: TripSelectorProps) => {
  if (trips.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Seleccionar Viaje</h3>
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-6 text-center">
            <MapPin size={32} className="mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500 font-medium">No hay viajes activos</p>
            <p className="text-sm text-gray-400 mt-1">
              Crea un viaje primero para usar el autocompletado
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">Seleccionar de tus Viajes</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {trips.map((trip) => (
          <Card
            key={trip.id}
            className={`cursor-pointer transition-all border-2 ${
              selectedTrip === trip.id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
            onClick={() => onTripSelect(trip.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4
                      className={`font-medium text-sm truncate ${
                        selectedTrip === trip.id
                          ? "text-blue-700"
                          : "text-gray-900"
                      }`}
                    >
                      {trip.name}
                    </h4>
                    {selectedTrip === trip.id && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <MapPin size={12} />
                      <span className="truncate">{trip.destination}</span>
                      {trip.coordinates && trip.coordinates.length > 1 && (
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0.5"
                        >
                          {trip.coordinates.length} destinos
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Calendar size={12} />
                      <span className="truncate">{trip.dates}</span>
                    </div>

                    {trip.travelers && (
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Users size={12} />
                        <span>{trip.travelers} viajeros</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TripSelector;
