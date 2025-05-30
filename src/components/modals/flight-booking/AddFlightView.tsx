
import { useState } from "react";
import { Plane, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AddFlightViewProps {
  onBackToMyFlights: () => void;
}

const AddFlightView = ({ onBackToMyFlights }: AddFlightViewProps) => {
  const [airline, setAirline] = useState("");
  const [reservationCode, setReservationCode] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!airline || !reservationCode || !lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Flight Found!",
        description: `Added ${airline} flight ${reservationCode} to your flights`,
      });
      onBackToMyFlights();
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Add Flight</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToMyFlights}
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Plane size={20} className="text-blue-600" />
            <h4 className="font-medium text-blue-800">Flight Information</h4>
          </div>
          <p className="text-sm text-blue-700">
            Enter your flight details to track your booking and get real-time updates
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="airline">Airline *</Label>
          <Input
            id="airline"
            placeholder="e.g., American Airlines, Delta, United"
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reservation">Confirmation/Reservation Code *</Label>
          <Input
            id="reservation"
            placeholder="e.g., ABC123, XYZ789"
            value={reservationCode}
            onChange={(e) => setReservationCode(e.target.value.toUpperCase())}
            className="uppercase"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="As shown on booking"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSearch}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Search size={16} className="mr-2 animate-spin" />
                Searching Flight...
              </>
            ) : (
              <>
                <Search size={16} className="mr-2" />
                Find My Flight
              </>
            )}
          </Button>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Tip:</strong> Your confirmation code is usually 5-6 characters and can be found in your booking email or airline app.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddFlightView;
