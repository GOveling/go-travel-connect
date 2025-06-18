
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users } from "lucide-react";
import { Trip } from "@/types";

interface TripSelectorProps {
  trips: Trip[];
  selectedTrip: Trip | null;
  onTripSelect: (trip: Trip) => void;
}

const TripSelector = ({ trips, selectedTrip, onTripSelect }: TripSelectorProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'traveling': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Próximo';
      case 'traveling': return 'Viajando';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <MapPin className="text-blue-600" size={20} />
            <span>Seleccionar Viaje</span>
          </CardTitle>
          <p className="text-sm text-blue-600">
            Elige un viaje para llenar automáticamente los datos y recibir recomendaciones de tours
          </p>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedTrip?.id.toString()} 
            onValueChange={(value) => {
              const trip = trips.find(t => t.id.toString() === value);
              if (trip) onTripSelect(trip);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un viaje..." />
            </SelectTrigger>
            <SelectContent>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <span>{trip.name}</span>
                    <Badge className={`text-xs ${getStatusColor(trip.status)}`}>
                      {getStatusText(trip.status)}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTrip && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-green-800">{selectedTrip.name}</h4>
                <Badge className={`text-xs ${getStatusColor(selectedTrip.status)}`}>
                  {getStatusText(selectedTrip.status)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center space-x-2 text-green-700">
                  <MapPin size={12} />
                  <span>{selectedTrip.destination}</span>
                </div>
                <div className="flex items-center space-x-2 text-green-700">
                  <Calendar size={12} />
                  <span>{selectedTrip.dates}</span>
                </div>
                <div className="flex items-center space-x-2 text-green-700">
                  <Users size={12} />
                  <span>{selectedTrip.travelers} viajeros</span>
                </div>
              </div>

              {selectedTrip.savedPlaces && selectedTrip.savedPlaces.length > 0 && (
                <div className="bg-white p-2 rounded border border-green-200">
                  <p className="text-xs font-medium text-green-800 mb-1">
                    Lugares guardados: {selectedTrip.savedPlaces.length}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTrip.savedPlaces.slice(0, 3).map((place, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {place.name}
                      </Badge>
                    ))}
                    {selectedTrip.savedPlaces.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{selectedTrip.savedPlaces.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TripSelector;
