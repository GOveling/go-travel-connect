import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Map, MapPin, Users, Calendar, Bookmark } from "lucide-react";

interface TripSelectorProps {
  trips: any[];
  selectedTripId: string | null;
  onSelectTrip: (tripId: string | null) => void;
  showSavedPlaces?: boolean;
  onToggleSavedPlaces?: () => void;
}

const TripSelector = ({ 
  trips, 
  selectedTripId, 
  onSelectTrip,
  showSavedPlaces = true,
  onToggleSavedPlaces
}: TripSelectorProps) => {
  
  const selectedTrip = trips.find(trip => trip.id === selectedTripId);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-green-500 text-white';
      case 'planning': return 'bg-purple-600 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Map size={20} className="text-purple-600" />
            <h3 className="font-semibold">Selector de Viajes</h3>
          </div>
          {selectedTripId && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectTrip(null)}
              className="h-8"
            >
              Ver Todos
            </Button>
          )}
        </div>

        {/* Trip Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Seleccionar Viaje</label>
          <Select
            value={selectedTripId || "all"}
            onValueChange={(value) => onSelectTrip(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🗺️ Todos los Viajes</SelectItem>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  <div className="flex items-center space-x-2">
                    <span>{trip.image}</span>
                    <span>{trip.name}</span>
                    <Badge className={`text-xs ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Trip Details */}
        {selectedTrip && (
          <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{selectedTrip.image}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{selectedTrip.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedTrip.dates}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <MapPin size={14} className="text-gray-500" />
                    <span>{selectedTrip.coordinates?.length || 0} destinos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bookmark size={14} className="text-gray-500" />
                    <span>{selectedTrip.savedPlaces?.length || 0} lugares guardados</span>
                  </div>
                  {selectedTrip.isGroupTrip && (
                    <div className="flex items-center space-x-1">
                      <Users size={14} className="text-purple-600" />
                      <span className="text-purple-600">Grupal</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trip Destinations */}
            {selectedTrip.coordinates && selectedTrip.coordinates.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Destinos:</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedTrip.coordinates.map((coord: any, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {coord.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Places Summary */}
            {selectedTrip.savedPlaces && selectedTrip.savedPlaces.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-gray-700">Lugares Guardados:</h5>
                  {onToggleSavedPlaces && (
                    <Button
                      size="sm"
                      variant={showSavedPlaces ? "default" : "outline"}
                      onClick={onToggleSavedPlaces}
                      className="h-6 text-xs"
                    >
                      {showSavedPlaces ? "Ocultar" : "Mostrar"}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedTrip.savedPlaces.slice(0, 4).map((place: any, index: number) => (
                    <div key={index} className="flex items-center space-x-1 bg-white rounded p-2">
                      <span>{place.image}</span>
                      <span className="truncate">{place.name}</span>
                    </div>
                  ))}
                  {selectedTrip.savedPlaces.length > 4 && (
                    <div className="col-span-2 text-center text-gray-500">
                      +{selectedTrip.savedPlaces.length - 4} lugares más
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats for Selected Trip */}
        {selectedTrip && (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-gray-50 rounded p-2">
              <div className="text-lg font-bold text-purple-600">
                {selectedTrip.coordinates?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Destinos</div>
            </div>
            <div className="text-center bg-gray-50 rounded p-2">
              <div className="text-lg font-bold text-green-600">
                {selectedTrip.savedPlaces?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Lugares</div>
            </div>
            <div className="text-center bg-gray-50 rounded p-2">
              <div className="text-lg font-bold text-orange-600">
                {selectedTrip.travelers || 1}
              </div>
              <div className="text-xs text-gray-600">Viajeros</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TripSelector;
