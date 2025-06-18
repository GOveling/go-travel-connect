
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, Brain } from "lucide-react";
import { Trip } from "@/types";

interface TripSelectionTabProps {
  trips: Trip[];
  selectedTrip: Trip | null;
  onTripSelect: (trip: Trip) => void;
  onSwitchToAI: () => void;
  onAutoFillFromTrip: (trip: Trip) => void;
}

const TripSelectionTab = ({ 
  trips, 
  selectedTrip, 
  onTripSelect, 
  onSwitchToAI,
  onAutoFillFromTrip 
}: TripSelectionTabProps) => {
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
      {/* Trip Selection Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <MapPin className="text-blue-600" size={20} />
            <span>Seleccionar Viaje Planificado</span>
          </CardTitle>
          <p className="text-sm text-blue-600">
            Elige un viaje de tu planificación para auto-llenar datos y recibir recomendaciones inteligentes de tours
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
              <SelectValue placeholder="Selecciona un viaje planificado..." />
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

      {/* Selected Trip Details */}
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

              {/* Saved Places Summary */}
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

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => onAutoFillFromTrip(selectedTrip)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                >
                  Auto-llenar Datos
                </Button>
                {selectedTrip.savedPlaces && selectedTrip.savedPlaces.length > 0 && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={onSwitchToAI}
                    className="flex-1 border-purple-300 text-purple-600 hover:bg-purple-50 text-xs"
                  >
                    <Brain size={12} className="mr-1" />
                    Ver Recomendaciones IA
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Trips Message */}
      {trips.length === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-orange-700 mb-2">
              No tienes viajes planificados aún
            </p>
            <p className="text-xs text-orange-600">
              Crea un viaje en la sección "My Trips" para utilizar el auto-llenado inteligente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TripSelectionTab;
