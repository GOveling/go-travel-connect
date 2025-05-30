
import { Plane, Calendar, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FlightOptionsViewProps {
  onSelectMyFlights: () => void;
  onSelectBookFlight: () => void;
}

const FlightOptionsView = ({ onSelectMyFlights, onSelectBookFlight }: FlightOptionsViewProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="font-semibold text-lg mb-2">Flight Services</h3>
        <p className="text-sm text-gray-600">Manage your flights or book new ones</p>
      </div>

      <div className="space-y-3">
        <Card 
          className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105 border-blue-200 bg-blue-50"
          onClick={onSelectMyFlights}
        >
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <Ticket size={32} className="text-white" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">My Flights</h4>
            <p className="text-sm text-gray-600 mb-4">
              View and manage your existing flight bookings
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
              onClick={onSelectMyFlights}
            >
              View My Flights
            </Button>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105 border-green-200 bg-green-50"
          onClick={onSelectBookFlight}
        >
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
              <Plane size={32} className="text-white" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Book New Flight</h4>
            <p className="text-sm text-gray-600 mb-4">
              Search and book flights for your next trip
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-green-500 to-green-600"
              onClick={onSelectBookFlight}
            >
              Book Flight
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlightOptionsView;
