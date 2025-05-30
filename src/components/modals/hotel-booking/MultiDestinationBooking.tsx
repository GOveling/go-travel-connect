
import { Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DestinationBooking {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

interface MultiDestinationBookingProps {
  bookings: DestinationBooking[];
  onUpdateBooking: (index: number, field: keyof DestinationBooking, value: string | number) => void;
}

const MultiDestinationBooking = ({ bookings, onUpdateBooking }: MultiDestinationBookingProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Building size={16} className="text-green-600" />
        <span className="font-medium text-green-800">Hotels for Each Destination</span>
      </div>
      
      {bookings.map((booking, index) => (
        <Card key={index} className="border-green-200">
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium text-gray-900">
              {booking.destination} - Hotel {index + 1}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Check-in</Label>
                <Input
                  type="date"
                  value={booking.checkIn}
                  onChange={(e) => onUpdateBooking(index, 'checkIn', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Check-out</Label>
                <Input
                  type="date"
                  value={booking.checkOut}
                  onChange={(e) => onUpdateBooking(index, 'checkOut', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Guests</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={booking.guests}
                  onChange={(e) => onUpdateBooking(index, 'guests', parseInt(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rooms</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={booking.rooms}
                  onChange={(e) => onUpdateBooking(index, 'rooms', parseInt(e.target.value))}
                  className="text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MultiDestinationBooking;
