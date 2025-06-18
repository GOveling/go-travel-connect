
import { Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DestinationTourBooking {
  destination: string;
  date: string;
  duration: string;
  tourType: string;
  participants: number;
}

interface MultiDestinationTourBookingProps {
  bookings: DestinationTourBooking[];
  onUpdateBooking: (index: number, field: keyof DestinationTourBooking, value: string | number) => void;
}

const MultiDestinationTourBooking = ({ bookings, onUpdateBooking }: MultiDestinationTourBookingProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Camera size={16} className="text-orange-600" />
        <span className="font-medium text-orange-800">Tours para Cada Destino</span>
      </div>
      
      {bookings.map((booking, index) => (
        <Card key={index} className="border-orange-200">
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium text-gray-900">
              {booking.destination} - Tour {index + 1}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Fecha del Tour</Label>
                <Input
                  type="date"
                  value={booking.date}
                  onChange={(e) => onUpdateBooking(index, 'date', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Participantes</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={booking.participants}
                  onChange={(e) => onUpdateBooking(index, 'participants', parseInt(e.target.value))}
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Tipo de Tour</Label>
                <Select value={booking.tourType} onValueChange={(value) => onUpdateBooking(index, 'tourType', value)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">City Tours</SelectItem>
                    <SelectItem value="cultural">Cultural Tours</SelectItem>
                    <SelectItem value="food">Food Tours</SelectItem>
                    <SelectItem value="adventure">Adventure Tours</SelectItem>
                    <SelectItem value="historical">Historical Tours</SelectItem>
                    <SelectItem value="nature">Nature Tours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Duración</Label>
                <Select value={booking.duration} onValueChange={(value) => onUpdateBooking(index, 'duration', value)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="half-day">Half Day (2-4 hours)</SelectItem>
                    <SelectItem value="full-day">Full Day (6-8 hours)</SelectItem>
                    <SelectItem value="multi-day">Multi-day (2+ days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MultiDestinationTourBooking;
