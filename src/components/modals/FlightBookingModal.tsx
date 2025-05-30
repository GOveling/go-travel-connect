
import { useState, useEffect } from "react";
import { Plane, Calendar, MapPin, Users, ArrowUpDown, Clock, CreditCard, X, MapPinIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHomeState } from "@/hooks/useHomeState";
import { useToast } from "@/hooks/use-toast";

interface FlightBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlightBookingModal = ({ isOpen, onClose }: FlightBookingModalProps) => {
  const [activeStep, setActiveStep] = useState(1);
  const [tripType, setTripType] = useState<'round-trip' | 'one-way'>('round-trip');
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState("New York, NY");
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy'
  });

  const { trips } = useHomeState();
  const { toast } = useToast();

  // Filter active trips
  const activeTrips = trips.filter(trip => 
    trip.status === 'upcoming' || trip.status === 'planning'
  );

  // Get user's current location (simulated)
  useEffect(() => {
    // Simulate getting current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates
          setCurrentLocation("New York, NY");
        },
        () => {
          setCurrentLocation("New York, NY");
        }
      );
    }
  }, []);

  // Auto-fill flight details when trip is selected
  const handleTripSelect = (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      setSelectedTrip(tripId);
      
      // Extract destinations from trip coordinates
      const destinations = trip.coordinates || [];
      
      if (destinations.length > 0) {
        const firstDestination = destinations[0].name;
        const lastDestination = destinations[destinations.length - 1].name;
        
        // Auto-fill form based on trip type
        if (destinations.length === 1) {
          // Single destination trip
          setFormData(prev => ({
            ...prev,
            from: currentLocation,
            to: firstDestination,
            departDate: extractStartDate(trip.dates),
            returnDate: extractEndDate(trip.dates)
          }));
          setTripType('round-trip');
        } else {
          // Multi-destination trip
          setFormData(prev => ({
            ...prev,
            from: currentLocation,
            to: firstDestination,
            departDate: extractStartDate(trip.dates),
            returnDate: extractEndDate(trip.dates)
          }));
          setTripType('round-trip');
        }

        // Show AI automation toast
        toast({
          title: "🤖 AI Auto-filled",
          description: `Flight details populated from "${trip.name}" itinerary`,
        });
      }
    }
  };

  // Extract start date from trip dates string
  const extractStartDate = (dateString: string): string => {
    try {
      const startDateStr = dateString.split(' - ')[0];
      const year = dateString.split(', ')[1] || new Date().getFullYear().toString();
      const month = startDateStr.split(' ')[0];
      const day = startDateStr.split(' ')[1];
      
      const monthMap: { [key: string]: string } = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
        'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      
      const monthNum = monthMap[month] || '01';
      const dayNum = day?.padStart(2, '0') || '01';
      
      return `${year}-${monthNum}-${dayNum}`;
    } catch {
      return '';
    }
  };

  // Extract end date from trip dates string
  const extractEndDate = (dateString: string): string => {
    try {
      const parts = dateString.split(' - ');
      if (parts.length < 2) return extractStartDate(dateString);
      
      const endDateStr = parts[1];
      const year = dateString.split(', ')[1] || new Date().getFullYear().toString();
      const month = endDateStr.split(' ')[0];
      const day = endDateStr.split(' ')[1];
      
      const monthMap: { [key: string]: string } = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
        'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      
      const monthNum = monthMap[month] || '01';
      const dayNum = day?.padStart(2, '0') || '01';
      
      return `${year}-${monthNum}-${dayNum}`;
    } catch {
      return '';
    }
  };

  const handleBooking = () => {
    toast({
      title: "Flight booking initiated!",
      description: "Redirecting to booking partner...",
    });
    onClose();
  };

  const steps = [
    { number: 1, title: "Trip Details", icon: Plane },
    { number: 2, title: "Flight Search", icon: Calendar },
    { number: 3, title: "Confirmation", icon: CreditCard }
  ];

  const flightClasses = [
    { value: 'economy', label: 'Economy', price: '$299' },
    { value: 'premium', label: 'Premium Economy', price: '$599' },
    { value: 'business', label: 'Business', price: '$1,299' },
    { value: 'first', label: 'First Class', price: '$2,499' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Plane size={24} />
            <div>
              <h2 className="text-xl font-bold">Book Flight</h2>
              <p className="text-sm opacity-90">AI-powered trip planning</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                activeStep >= step.number 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {activeStep > step.number ? '✓' : step.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  activeStep > step.number ? 'bg-blue-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {/* Step 1: Trip Selection */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div>
                {/* Current Location Display */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <MapPinIcon size={16} />
                    <span className="text-sm font-medium">Current Location</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">{currentLocation}</p>
                </div>

                <h3 className="font-semibold mb-3">Select Trip or Create New</h3>
                
                {activeTrips.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <Label className="text-sm text-gray-600">Your Active Trips (AI Auto-fill)</Label>
                    {activeTrips.map((trip) => (
                      <Card 
                        key={trip.id}
                        className={`cursor-pointer transition-all ${
                          selectedTrip === trip.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => handleTripSelect(trip.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-xl">{trip.image}</div>
                              <div>
                                <p className="font-medium text-sm">{trip.name}</p>
                                <p className="text-xs text-gray-600">{trip.destination}</p>
                                <p className="text-xs text-gray-500">{trip.dates}</p>
                                {trip.coordinates && trip.coordinates.length > 0 && (
                                  <p className="text-xs text-blue-600">
                                    🤖 Route: {currentLocation} → {trip.coordinates[0].name}
                                    {trip.coordinates.length > 1 && ` → ${trip.coordinates[trip.coordinates.length - 1].name}`}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge variant={selectedTrip === trip.id ? "default" : "outline"}>
                              {selectedTrip === trip.id ? 'Selected' : 'Auto-fill'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-sm text-gray-600">Or Book Independently</Label>
                  
                  {/* Trip Type Selection */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={tripType === 'round-trip' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTripType('round-trip')}
                      className="h-10"
                    >
                      Round Trip
                    </Button>
                    <Button
                      variant={tripType === 'one-way' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTripType('one-way')}
                      className="h-10"
                    >
                      One Way
                    </Button>
                  </div>

                  {/* From/To Inputs */}
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="from" className="text-sm">From</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                        <Input
                          id="from"
                          placeholder="Departure city"
                          value={formData.from}
                          onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button variant="ghost" size="sm" className="p-2 rounded-full bg-gray-100">
                        <ArrowUpDown size={16} />
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="to" className="text-sm">To</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                        <Input
                          id="to"
                          placeholder="Destination city"
                          value={formData.to}
                          onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setActiveStep(2)}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600"
                disabled={!formData.from || !formData.to}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Flight Details */}
          {activeStep === 2 && (
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
                  onClick={() => setActiveStep(1)}
                  className="flex-1 h-12"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setActiveStep(3)}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600"
                  disabled={!formData.departDate || (tripType === 'round-trip' && !formData.returnDate)}
                >
                  Review
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Flight Summary</h3>
              
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Plane size={16} className="text-blue-600" />
                      <span className="font-medium text-sm">
                        {formData.from} → {formData.to}
                      </span>
                    </div>
                    <Badge>{tripType === 'round-trip' ? 'Round Trip' : 'One Way'}</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formData.departDate}</span>
                    </div>
                    {tripType === 'round-trip' && formData.returnDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formData.returnDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{formData.passengers} passenger{formData.passengers > 1 ? 's' : ''}</span>
                    </div>
                    <span className="capitalize">{formData.class} class</span>
                  </div>

                  {selectedTrip && (
                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-xs text-blue-700">
                        🤖 Auto-filled from: {trips.find(t => t.id === selectedTrip)?.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-green-800">
                  <Clock size={16} />
                  <span className="text-sm font-medium">Best Price Guarantee</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Find a lower price within 24 hours and we'll match it!
                </p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveStep(2)}
                  className="flex-1 h-12"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleBooking}
                  className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600"
                >
                  Book Flight
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlightBookingModal;
