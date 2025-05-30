
import { useState } from "react";
import { Utensils, Calendar, Users, Clock, X, Star } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface RestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RestaurantModal = ({ isOpen, onClose }: RestaurantModalProps) => {
  const [formData, setFormData] = useState({
    location: '',
    date: '',
    time: '19:00',
    guests: 2,
    cuisine: '',
    occasion: ''
  });
  const { toast } = useToast();

  const handleSearch = () => {
    toast({
      title: "Searching Restaurants",
      description: "Finding available tables for your dining experience...",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Utensils size={24} />
            <div>
              <h2 className="text-xl font-bold">Restaurant Booking</h2>
              <p className="text-sm opacity-90">Reserve your perfect table</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Star size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-800">Premium Tables</span>
              </div>
              <p className="text-xs text-red-700">
                Access exclusive reservations at top-rated restaurants!
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City or neighborhood"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.guests}
                  onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Select value={formData.cuisine} onValueChange={(value) => setFormData(prev => ({ ...prev, cuisine: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion (Optional)</Label>
              <Select value={formData.occasion} onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="date">Date Night</SelectItem>
                  <SelectItem value="business">Business Meeting</SelectItem>
                  <SelectItem value="celebration">Celebration</SelectItem>
                  <SelectItem value="casual">Casual Dining</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-red-500 to-red-600"
            >
              <Utensils size={16} className="mr-2" />
              Find Tables
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantModal;
