
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar, MapPin, Plus, ArrowLeft } from "lucide-react";

interface MyFlightsViewProps {
  onBackToOptions: () => void;
  onAddFlight: () => void;
}

const MyFlightsView = ({ onBackToOptions, onAddFlight }: MyFlightsViewProps) => {
  // Mock flight data
  const flights = [
    {
      id: 1,
      airline: "Delta Airlines",
      flightNumber: "DL 1234",
      from: "New York (JFK)",
      to: "Los Angeles (LAX)",
      departureDate: "2024-03-15",
      departureTime: "08:30",
      arrivalTime: "11:45",
      status: "confirmed",
      price: "$299"
    },
    {
      id: 2,
      airline: "American Airlines",
      flightNumber: "AA 5678",
      from: "Los Angeles (LAX)",
      to: "New York (JFK)",
      departureDate: "2024-03-20",
      departureTime: "14:15",
      arrivalTime: "22:30",
      status: "pending",
      price: "$319"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBackToOptions} className="flex items-center space-x-2">
          <ArrowLeft size={16} />
          <span>Back to Search</span>
        </Button>
        <Button onClick={onAddFlight} size="sm" className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Add Flight</span>
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Your Booked Flights</h3>
        
        {flights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Plane size={48} className="mx-auto mb-3 opacity-50" />
            <p>No flights booked yet</p>
            <Button onClick={onAddFlight} className="mt-3">
              Book Your First Flight
            </Button>
          </div>
        ) : (
          flights.map((flight) => (
            <Card key={flight.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{flight.airline}</h4>
                    <p className="text-sm text-gray-600">{flight.flightNumber}</p>
                  </div>
                  <Badge className={getStatusColor(flight.status)}>
                    {flight.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-sm">{flight.from} → {flight.to}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm">
                      {new Date(flight.departureDate).toLocaleDateString()} • 
                      {flight.departureTime} - {flight.arrivalTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="font-semibold text-blue-600">{flight.price}</span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {flight.status === 'confirmed' && (
                      <Button size="sm">
                        Check In
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyFlightsView;
