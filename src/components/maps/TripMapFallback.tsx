import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Calendar, Navigation } from "lucide-react";

interface TripMapFallbackProps {
  trips: any[];
}

const TripMapFallback = ({ trips }: TripMapFallbackProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-500";
      case "planning":
        return "bg-purple-600";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {/* Fallback Header */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center space-y-4">
            <MapPin size={48} className="mx-auto text-purple-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Vista de Mapa No Disponible
              </h3>
              <p className="text-gray-600">
                Aquí tienes un resumen de tus viajes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {trips.length}
            </div>
            <div className="text-sm text-gray-600">Total Viajes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {trips.filter((t) => t.status === "upcoming").length}
            </div>
            <div className="text-sm text-gray-600">Próximos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {trips.filter((t) => t.status === "planning").length}
            </div>
            <div className="text-sm text-gray-600">Planificando</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {trips.reduce(
                (total, trip) => total + (trip.coordinates?.length || 0),
                0
              )}
            </div>
            <div className="text-sm text-gray-600">Destinos</div>
          </CardContent>
        </Card>
      </div>

      {/* Trip List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Todos los Destinos
        </h3>
        {trips.map((trip) => (
          <Card key={trip.id} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 rounded-lg flex items-center justify-center text-2xl">
                  {trip.image}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-lg">{trip.name}</h4>
                    <span
                      className={`w-3 h-3 rounded-full ${getStatusColor(trip.status)}`}
                    ></span>
                    {trip.isGroupTrip && (
                      <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full">
                        <Users size={12} className="text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">
                          Viaje Grupal
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{trip.dates}</p>

                  {/* Destinations */}
                  <div className="space-y-1">
                    {trip.coordinates?.map((coord: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <MapPin size={14} className="text-purple-600" />
                        <span className="text-gray-700">{coord.name}</span>
                        <span className="text-gray-500">
                          ({coord.lat.toFixed(4)}, {coord.lng.toFixed(4)})
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Saved Places Count */}
                  {trip.savedPlaces && trip.savedPlaces.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <Navigation size={14} />
                        <span>{trip.savedPlaces.length} lugares guardados</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Leyenda de Estados</h4>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">Próximos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              <span className="text-sm text-gray-700">Planificando</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-sm text-gray-700">Completados</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-center text-blue-800">
            <p className="text-sm">
              💡 <strong>Nota:</strong> El mapa interactivo se cargará
              automáticamente cuando esté disponible. Mientras tanto, puedes ver
              todos los detalles de tus viajes en esta vista.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripMapFallback;
