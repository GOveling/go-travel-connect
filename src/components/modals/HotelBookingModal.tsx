
import { useState } from "react";
import { Building, Calendar, Users, MapPin, X, Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface HotelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HotelBookingModal = ({ isOpen, onClose }: HotelBookingModalProps) => {
  const [formData, setFormData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1
  });
  const { toast } = useToast();

  const handleSearch = () => {
    toast({
      title: "Searching Hotels",
      description: "Finding the best deals for your stay...",
    });
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

            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-green-500 to-green-600"
            >
              <Building size={16} className="mr-2" />
              Search Hotels
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotelBookingModal;
