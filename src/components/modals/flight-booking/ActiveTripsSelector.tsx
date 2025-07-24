import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users } from "lucide-react";

interface ActiveTripsSelectorProps {
  activeTrips: any[];
  selectedTrip: number | null;
  onTripSelect: (tripId: number) => void;
}

const ActiveTripsSelector = ({
  activeTrips,
  selectedTrip,
  onTripSelect,
}: ActiveTripsSelectorProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">
        Select from Your Active Trips
      </h3>
      <div className="space-y-2">
        {activeTrips.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-gray-500">
              <MapPin size={32} className="mx-auto mb-2 opacity-50" />
              <p>No active trips found</p>
              <p className="text-sm">Create a trip first to use auto-fill</p>
            </CardContent>
          </Card>
        ) : (
          activeTrips.map((trip) => (
            <Card
              key={trip.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTrip === trip.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : ""
              }`}
              onClick={() => onTripSelect(trip.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{trip.name}</h4>
                  <Badge variant="secondary" className="ml-2">
                    {trip.status || "Active"}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin size={14} />
                    <span>{trip.destination}</span>
                    {trip.coordinates && trip.coordinates.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {trip.coordinates.length} destinos
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar size={14} />
                    <span>{trip.dates}</span>
                  </div>

                  {trip.travelers && (
                    <div className="flex items-center space-x-2">
                      <Users size={14} />
                      <span>{trip.travelers} travelers</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveTripsSelector;
