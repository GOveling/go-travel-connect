
import { Plane, Calendar, Users, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MyFlightsViewProps {
  onBackToOptions: () => void;
}

const MyFlightsView = ({ onBackToOptions }: MyFlightsViewProps) => {
  // Mock flight data - in a real app, this would come from an API
  const myFlights = [
    {
      id: 1,
      bookingRef: "ABC123",
      status: "confirmed",
      from: "New York, NY",
      to: "Paris, FR",
      departDate: "2024-12-15",
      departTime: "14:30",
      arriveTime: "07:45+1",
      airline: "Air France",
      flightNumber: "AF007",
      class: "Economy",
      passengers: 2,
      gate: "A12",
      seat: "12A, 12B"
    },
    {
      id: 2,
      bookingRef: "XYZ789",
      status: "upcoming",
      from: "Paris, FR",
      to: "New York, NY",
      departDate: "2024-12-22",
      departTime: "10:15",
      arriveTime: "13:30",
      airline: "Air France",
      flightNumber: "AF008",
      class: "Economy",
      passengers: 2,
      gate: "TBD",
      seat: "15C, 15D"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">My Flights</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToOptions}
        >
          Back
        </Button>
      </div>

      {myFlights.length === 0 ? (
        <div className="text-center py-8">
          <Plane size={48} className="mx-auto text-gray-400 mb-4" />
          <h4 className="font-medium text-gray-600 mb-2">No flights found</h4>
          <p className="text-sm text-gray-500">You don't have any flights booked yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myFlights.map((flight) => (
            <Card key={flight.id} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(flight.status)}>
                      {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                    </Badge>
                    <span className="text-sm font-medium text-gray-600">
                      {flight.bookingRef}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{flight.airline}</p>
                    <p className="text-sm font-medium">{flight.flightNumber}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <MapPin size={16} className="text-blue-600" />
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{flight.from}</span>
                      <ArrowRight size={14} className="text-gray-400" />
                      <span className="font-medium text-sm">{flight.to}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} className="text-gray-500" />
                    <span className="text-sm">{flight.departDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={14} className="text-gray-500" />
                    <span className="text-sm">{flight.departTime} - {flight.arriveTime}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div>
                    <span className="text-xs text-gray-500">Passengers:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <Users size={12} />
                      <span>{flight.passengers}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Class:</span>
                    <p className="mt-1">{flight.class}</p>
                  </div>
                </div>

                {flight.gate && flight.gate !== 'TBD' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-gray-500">Gate:</span>
                        <p className="font-medium">{flight.gate}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Seat:</span>
                        <p className="font-medium">{flight.seat}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Check-in
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFlightsView;
