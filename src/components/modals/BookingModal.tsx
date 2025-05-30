
import { useState } from "react";
import { MapPin, Calendar, Users, Plane, Building, Car, MapPin as TourIcon, Smartphone, Utensils, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trip } from "@/types/aiSmartRoute";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: string;
  trips: Trip[];
}

const BookingModal = ({ isOpen, onClose, bookingType, trips }: BookingModalProps) => {
  const { toast } = useToast();
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [bookingDetails, setBookingDetails] = useState({
    dates: "",
    travelers: 1,
    preferences: "",
    budget: ""
  });

  const getBookingIcon = () => {
    switch (bookingType) {
      case "Flights": return <Plane className="text-blue-600" size={24} />;
      case "Hotels": return <Building className="text-green-600" size={24} />;
      case "Car Rental": return <Car className="text-purple-600" size={24} />;
      case "Tours": return <TourIcon className="text-orange-600" size={24} />;
      case "eSIMs": return <Smartphone className="text-pink-600" size={24} />;
      case "Restaurants": return <Utensils className="text-red-600" size={24} />;
      default: return <Plane className="text-blue-600" size={24} />;
    }
  };

  const getBookingColor = () => {
    switch (bookingType) {
      case "Flights": return "from-blue-500 to-blue-600";
      case "Hotels": return "from-green-500 to-green-600";
      case "Car Rental": return "from-purple-500 to-purple-600";
      case "Tours": return "from-orange-500 to-orange-600";
      case "eSIMs": return "from-pink-500 to-pink-600";
      case "Restaurants": return "from-red-500 to-red-600";
      default: return "from-blue-500 to-blue-600";
    }
  };

  const selectedTrip = trips.find(trip => trip.id === selectedTripId);
  const availableTrips = trips.filter(trip => trip.status !== 'completed');

  const handleBooking = () => {
    if (!selectedTripId) {
      toast({
        title: "Trip Required",
        description: "Please select a trip for your booking.",
        variant: "destructive"
      });
      return;
    }

    // In the future, this will integrate with Affiliated APIs
    toast({
      title: "Booking Request Submitted!",
      description: `Your ${bookingType.toLowerCase()} booking request for ${selectedTrip?.name} has been submitted. You'll receive confirmation via mobile app.`,
    });

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedTripId(null);
    setBookingDetails({
      dates: "",
      travelers: 1,
      preferences: "",
      budget: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "traveling":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
            {getBookingIcon()}
            Book {bookingType}
          </DialogTitle>
          <p className="text-sm text-gray-600 text-center">
            Select a trip and provide booking details
          </p>
        </DialogHeader>
        
        <div className="space-y-6 px-1">
          {/* Trip Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Select Trip</h3>
            {availableTrips.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableTrips.map((trip) => (
                  <Card 
                    key={trip.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedTripId === trip.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTripId(trip.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getBookingColor()} rounded-lg flex items-center justify-center`}>
                          <span className="text-lg">{trip.image}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm text-gray-800 truncate">{trip.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(trip.status)}`}>
                              {trip.status}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <MapPin size={10} />
                              <span className="truncate">{trip.destination}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <Calendar size={10} />
                              <span>{trip.dates}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-gray-300">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-500">No trips available for booking</p>
                  <Button variant="link" size="sm" className="mt-2">
                    Create a new trip
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Details */}
          {selectedTripId && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Booking Details</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dates" className="text-sm">Dates</Label>
                  <Input
                    id="dates"
                    placeholder="Dec 15-20, 2024"
                    value={bookingDetails.dates}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, dates: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="travelers" className="text-sm">Travelers</Label>
                  <Select 
                    value={bookingDetails.travelers.toString()} 
                    onValueChange={(value) => setBookingDetails(prev => ({ ...prev, travelers: parseInt(value) }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'person' : 'people'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="budget" className="text-sm">Budget Range</Label>
                <Select 
                  value={bookingDetails.budget} 
                  onValueChange={(value) => setBookingDetails(prev => ({ ...prev, budget: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget ($0-$500)</SelectItem>
                    <SelectItem value="mid-range">Mid-range ($500-$1500)</SelectItem>
                    <SelectItem value="luxury">Luxury ($1500+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferences" className="text-sm">Special Preferences</Label>
                <Input
                  id="preferences"
                  placeholder={`Any special requirements for ${bookingType.toLowerCase()}...`}
                  value={bookingDetails.preferences}
                  onChange={(e) => setBookingDetails(prev => ({ ...prev, preferences: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Integration Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Smartphone size={16} className="text-blue-600" />
                <p className="text-xs text-blue-700">
                  This booking will be processed through our mobile app with affiliated partners
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              disabled={!selectedTripId}
              className={`flex-1 bg-gradient-to-r ${getBookingColor()}`}
            >
              Submit Booking
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
