
import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface FlightDetailsStepProps {
  tripType: 'round-trip' | 'one-way';
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  onBack: () => void;
  onContinue: () => void;
}

const flightClasses = [
  { value: 'economy', label: 'Economy', price: '$299' },
  { value: 'premium', label: 'Premium Economy', price: '$599' },
  { value: 'business', label: 'Business', price: '$1,299' },
  { value: 'first', label: 'First Class', price: '$2,499' }
];

const FlightDetailsStep = ({
  tripType,
  formData,
  setFormData,
  onBack,
  onContinue
}: FlightDetailsStepProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="departDate" className="text-sm">Departure</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
            <Input
              id="departDate"
              type="date"
              value={formData.departDate}
              onChange={(e) => setFormData(prev => ({ ...prev, departDate: e.target.value }))}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {tripType === 'round-trip' && (
          <div>
            <Label htmlFor="returnDate" className="text-sm">Return</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
              <Input
                id="returnDate"
                type="date"
                value={formData.returnDate}
                onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                className="pl-10 h-12"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="passengers" className="text-sm">Passengers</Label>
        <div className="relative">
          <Users className="absolute left-3 top-3 text-gray-400" size={16} />
          <Input
            id="passengers"
            type="number"
            min="1"
            max="9"
            value={formData.passengers}
            onChange={(e) => setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
            className="pl-10 h-12"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm">Class</Label>
        <div className="grid grid-cols-1 gap-2 mt-2">
          {flightClasses.map((flightClass) => (
            <Card
              key={flightClass.value}
              className={`cursor-pointer transition-all ${
                formData.class === flightClass.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, class: flightClass.value }))}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{flightClass.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{flightClass.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 h-12"
        >
          Back
        </Button>
        <Button 
          onClick={onContinue}
          className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600"
          disabled={!formData.departDate || (tripType === 'round-trip' && !formData.returnDate)}
        >
          Review
        </Button>
      </div>
    </div>
  );
};

export default FlightDetailsStep;
