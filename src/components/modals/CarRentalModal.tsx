
import { useState } from "react";
import { Car, Calendar, MapPin, Clock, X, Fuel } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CarRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CarRentalModal = ({ isOpen, onClose }: CarRentalModalProps) => {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    pickupTime: '10:00',
    dropoffTime: '10:00',
    carType: ''
  });
  const { toast } = useToast();

  const handleSearch = () => {
    toast({
      title: "Searching Cars",
      description: "Finding available rental cars for your trip...",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Car size={24} />
            <div>
              <h2 className="text-xl font-bold">Car Rental</h2>
              <p className="text-sm opacity-90">Explore at your own pace</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Fuel size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Free Cancellation</span>
              </div>
              <p className="text-xs text-purple-700">
                Cancel up to 24 hours before pickup for free!
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickupLocation">Pick-up Location</Label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  id="pickupLocation"
                  placeholder="Airport, hotel, or address"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dropoffLocation">Drop-off Location</Label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  id="dropoffLocation"
                  placeholder="Same as pick-up or different"
                  value={formData.dropoffLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, dropoffLocation: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pick-up Date</Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoffDate">Drop-off Date</Label>
                <Input
                  id="dropoffDate"
                  type="date"
                  value={formData.dropoffDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dropoffDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pickupTime">Pick-up Time</Label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="pickupTime"
                    type="time"
                    value={formData.pickupTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickupTime: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoffTime">Drop-off Time</Label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="dropoffTime"
                    type="time"
                    value={formData.dropoffTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, dropoffTime: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carType">Car Type</Label>
              <Select value={formData.carType} onValueChange={(value) => setFormData(prev => ({ ...prev, carType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select car type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="midsize">Midsize</SelectItem>
                  <SelectItem value="fullsize">Full-size</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600"
            >
              <Car size={16} className="mr-2" />
              Search Cars
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CarRentalModal;
