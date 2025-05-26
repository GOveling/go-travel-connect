
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface TripCoordinate {
  name: string;
  lat: number;
  lng: number;
}

interface Trip {
  id: number;
  name: string;
  destination: string;
  dates: string;
  status: string;
  travelers: number;
  image: string;
  coordinates: TripCoordinate[];
}

interface TripMapProps {
  trips: Trip[];
}

const TripMap = ({ trips }: TripMapProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-500";
      case "planning":
        return "bg-blue-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  // For now, showing a placeholder map with trip locations listed
  // In a real implementation, this would integrate with a mapping library
  return (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <Card className="h-96 bg-gradient-to-br from-blue-100 to-green-100 border-2 border-dashed border-blue-300">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="mx-auto text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map Coming Soon</h3>
            <p className="text-gray-600">Your trip destinations will be displayed here</p>
            <p className="text-sm text-gray-500 mt-2">Connect to mapping service to enable full map functionality</p>
          </div>
        </CardContent>
      </Card>

      {/* Trip Locations List */}
      <div className="grid gap-4">
        <h3 className="text-xl font-semibold text-gray-800">All Trip Destinations</h3>
        {trips.map((trip) => (
          <Card key={trip.id} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center text-2xl">
                  {trip.image}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-lg">{trip.name}</h4>
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(trip.status)}`}></span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{trip.dates}</p>
                  <div className="space-y-1">
                    {trip.coordinates.map((coord, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <MapPin size={14} className="text-blue-500" />
                        <span className="text-gray-700">{coord.name}</span>
                        <span className="text-gray-500">({coord.lat.toFixed(4)}, {coord.lng.toFixed(4)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Trip Status Legend</h4>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">Upcoming</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-700">Planning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span className="text-sm text-gray-700">Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripMap;
