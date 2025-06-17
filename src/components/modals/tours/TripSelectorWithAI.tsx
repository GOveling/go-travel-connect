
import { Route, MapPin, Calendar, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trip } from "@/types";

interface TripSelectorWithAIProps {
  selectedTripId: string;
  trips: Trip[];
  onTripSelection: (tripId: string) => void;
}

const TripSelectorWithAI = ({ selectedTripId, trips, onTripSelection }: TripSelectorWithAIProps) => {
  const selectedTrip = trips.find(trip => trip.id.toString() === selectedTripId);

  return (
    <div className="space-y-3">
      <Label htmlFor="tripSelection">Seleccionar Viaje para Auto-Fill IA</Label>
      
      <div className="relative">
        <Route size={16} className="absolute left-3 top-3 text-gray-400 z-10" />
        <Select value={selectedTripId} onValueChange={onTripSelection}>
          <SelectTrigger className="pl-10">
            <SelectValue placeholder="Elegir viaje para llenar automáticamente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">
              <div className="flex flex-col">
                <span className="font-medium">Entrada manual</span>
                <span className="text-xs text-gray-500">Llenar manualmente los datos</span>
              </div>
            </SelectItem>
            {trips.map((trip) => (
              <SelectItem key={trip.id} value={trip.id.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{trip.name}</span>
                  <span className="text-xs text-gray-500">
                    {trip.destination} • {trip.dates}
                    {trip.coordinates && trip.coordinates.length > 1 && 
                      <span className="ml-1 text-orange-600">({trip.coordinates.length} destinos)</span>
                    }
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trip Preview Card */}
      {selectedTrip && selectedTripId !== 'manual' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{selectedTrip.image}</span>
                <div>
                  <h4 className="font-semibold text-orange-900">{selectedTrip.name}</h4>
                  <p className="text-sm text-orange-700">{selectedTrip.dates}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white border-orange-300 text-orange-800">
                🤖 IA Auto-Fill
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-orange-800">
                <MapPin size={14} />
                <span>Destinos: {selectedTrip.coordinates?.length || 1}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-orange-800">
                <Users size={14} />
                <span>Viajeros: {selectedTrip.travelers}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-orange-800">
                <Calendar size={14} />
                <span>Estado: {selectedTrip.status}</span>
              </div>

              {selectedTrip.coordinates && selectedTrip.coordinates.length > 0 && (
                <div className="mt-3 p-2 bg-white rounded border border-orange-200">
                  <p className="text-xs font-medium text-orange-900 mb-1">🧠 IA analizará:</p>
                  <ul className="text-xs text-orange-800 space-y-1">
                    {selectedTrip.coordinates.map((dest, index) => (
                      <li key={index}>• Tours en {dest.name}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-orange-600 mt-2 font-medium">
                    ✨ Tipos de tour automáticos según lugares guardados
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TripSelectorWithAI;
