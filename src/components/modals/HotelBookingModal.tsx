
import { useState } from "react";
import { Building, Calendar, Users, MapPin, X, Star, Route } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useHomeState } from "@/hooks/useHomeState";
import { getDestinationDateRanges } from "@/utils/dateUtils";

interface HotelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DestinationBooking {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

const HotelBookingModal = ({ isOpen, onClose }: HotelBookingModalProps) => {
  const [formData, setFormData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1
  });
  const [selectedTripId, setSelectedTripId] = useState<string>('manual');
  const [multiDestinationBookings, setMultiDestinationBookings] = useState<DestinationBooking[]>([]);
  const [isMultiDestination, setIsMultiDestination] = useState(false);
  const { toast } = useToast();
  const { trips } = useHomeState();

  const handleTripSelection = (tripId: string) => {
    setSelectedTripId(tripId);
    
    if (tripId === 'manual') {
      // Reset form when manual entry is selected
      setFormData({
        destination: '',
        checkIn: '',
        checkOut: '',
        guests: 2,
        rooms: 1
      });
      setMultiDestinationBookings([]);
      setIsMultiDestination(false);
      return;
    }

    const selectedTrip = trips.find(trip => trip.id.toString() === tripId);
    if (selectedTrip) {
      // Check if trip has multiple destinations
      const destinations = selectedTrip.itinerary?.destinations || [];
      const isMultiDest = destinations.length > 1;
      
      setIsMultiDestination(isMultiDest);

      if (isMultiDest) {
        // Handle multi-destination trip
        const dateRanges = getDestinationDateRanges(selectedTrip.dates, destinations.length);
        
        const bookings: DestinationBooking[] = destinations.map((dest, index) => {
          const range = dateRanges[index];
          const formatDateForInput = (date: Date) => {
            return date.toISOString().split('T')[0];
          };

          return {
            destination: dest.city,
            checkIn: formatDateForInput(range.startDate),
            checkOut: formatDateForInput(range.endDate),
            guests: selectedTrip.travelers || 2,
            rooms: 1
          };
        });

        setMultiDestinationBookings(bookings);
        
        // Clear single destination form
        setFormData({
          destination: '',
          checkIn: '',
          checkOut: '',
          guests: 2,
          rooms: 1
        });
      } else {
        // Handle single destination trip (existing logic)
        const parseTripDates = (dateStr: string) => {
          try {
            const [dateRange, year] = dateStr.split(', ');
            const [startDate, endDate] = dateRange.split(' - ');
            const currentYear = year || new Date().getFullYear().toString();
            
            const parseDate = (dateStr: string) => {
              const [month, day] = dateStr.trim().split(' ');
              const monthMap: { [key: string]: string } = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
              };
              const monthNum = monthMap[month] || '01';
              const dayNum = day.padStart(2, '0');
              return `${currentYear}-${monthNum}-${dayNum}`;
            };

            return {
              checkIn: parseDate(startDate),
              checkOut: parseDate(endDate)
            };
          } catch (error) {
            console.log('Error parsing dates:', error);
            return { checkIn: '', checkOut: '' };
          }
        };

        const { checkIn, checkOut } = parseTripDates(selectedTrip.dates);
        
        setFormData(prev => ({
          ...prev,
          destination: destinations[0]?.city || selectedTrip.destination,
          checkIn,
          checkOut,
          guests: selectedTrip.travelers || 2
        }));
        
        setMultiDestinationBookings([]);
      }
    }
  };

  const updateMultiDestinationBooking = (index: number, field: keyof DestinationBooking, value: string | number) => {
    setMultiDestinationBookings(prev => 
      prev.map((booking, i) => 
        i === index ? { ...booking, [field]: value } : booking
      )
    );
  };

  const handleSearch = () => {
    if (isMultiDestination) {
      toast({
        title: "Searching Hotels for All Destinations",
        description: `Finding the best deals for your ${multiDestinationBookings.length} destinations...`,
      });
    } else {
      toast({
        title: "Searching Hotels",
        description: "Finding the best deals for your stay...",
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Building size={24} />
            <div>
              <h2 className="text-xl font-bold">Hotel Booking</h2>
              <p className="text-sm opacity-90">Find your perfect stay</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Star size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">Special Offer</span>
              </div>
              <p className="text-xs text-green-700">
                Book now and get 15% off your first hotel booking!
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {/* Trip Selection */}
            <div className="space-y-2">
              <Label htmlFor="tripSelection">Select from My Trips (Optional)</Label>
              <div className="relative">
                <Route size={16} className="absolute left-3 top-3 text-gray-400" />
                <Select value={selectedTripId} onValueChange={handleTripSelection}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Choose a trip to auto-fill details" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual entry</SelectItem>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{trip.name}</span>
                          <span className="text-xs text-gray-500">
                            {trip.destination} • {trip.dates}
                            {trip.itinerary?.destinations && trip.itinerary.destinations.length > 1 && 
                              <span className="ml-1 text-green-600">({trip.itinerary.destinations.length} destinations)</span>
                            }
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Multi-destination bookings */}
            {isMultiDestination && multiDestinationBookings.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Building size={16} className="text-green-600" />
                  <span className="font-medium text-green-800">Hotels for Each Destination</span>
                </div>
                
                {multiDestinationBookings.map((booking, index) => (
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
                            onChange={(e) => updateMultiDestinationBooking(index, 'checkIn', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Check-out</Label>
                          <Input
                            type="date"
                            value={booking.checkOut}
                            onChange={(e) => updateMultiDestinationBooking(index, 'checkOut', e.target.value)}
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
                            onChange={(e) => updateMultiDestinationBooking(index, 'guests', parseInt(e.target.value))}
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
                            onChange={(e) => updateMultiDestinationBooking(index, 'rooms', parseInt(e.target.value))}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Single destination form (only show when not multi-destination) */}
            {!isMultiDestination && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="destination"
                      placeholder="Where are you going?"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOut">Check-out</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={formData.checkOut}
                      onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </>
            )}

            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-green-500 to-green-600"
            >
              <Building size={16} className="mr-2" />
              {isMultiDestination ? `Search Hotels for ${multiDestinationBookings.length} Destinations` : 'Search Hotels'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotelBookingModal;
