
import { MapPin, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

interface SingleDestinationFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

const SingleDestinationForm = ({ formData, onFormDataChange }: SingleDestinationFormProps) => {
  const updateFormData = (field: keyof FormData, value: string | number) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
          <Input
            id="destination"
            placeholder="Where are you going?"
            value={formData.destination}
            onChange={(e) => updateFormData('destination', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="checkIn">Check-in</Label>
          <Input
            id="checkIn"
            type="date"
            value={formData.checkIn}
            onChange={(e) => updateFormData('checkIn', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkOut">Check-out</Label>
          <Input
            id="checkOut"
            type="date"
            value={formData.checkOut}
            onChange={(e) => updateFormData('checkOut', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="guests">Guests</Label>
          <div className="relative">
            <Users size={16} className="absolute left-3 top-3 text-gray-400" />
            <Input
              id="guests"
              type="number"
              min="1"
              max="10"
              value={formData.guests}
              onChange={(e) => updateFormData('guests', parseInt(e.target.value))}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rooms">Rooms</Label>
          <Input
            id="rooms"
            type="number"
            min="1"
            max="5"
            value={formData.rooms}
            onChange={(e) => updateFormData('rooms', parseInt(e.target.value))}
          />
        </div>
      </div>
    </>
  );
};

export default SingleDestinationForm;
