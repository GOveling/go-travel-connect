
import { useState } from "react";
import { MapPin, Calendar, Users, Clock, X, Camera } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ToursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToursModal = ({ isOpen, onClose }: ToursModalProps) => {
  const [formData, setFormData] = useState({
    destination: '',
    date: '',
    participants: 2,
    tourType: '',
    duration: ''
  });
  const { toast } = useToast();

  const handleSearch = () => {
    toast({
      title: "Searching Tours",
      description: "Finding amazing guided experiences for you...",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <MapPin size={24} />
            <div>
              <h2 className="text-xl font-bold">Tours & Experiences</h2>
              <p className="text-sm opacity-90">Discover guided adventures</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Camera size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Local Experts</span>
              </div>
              <p className="text-xs text-orange-700">
                Book tours with certified local guides and create memories!
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
                  placeholder="Where do you want to explore?"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tour Date</Label>
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
              <Label htmlFor="participants">Participants</Label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  id="participants"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.participants}
                  onChange={(e) => setFormData(prev => ({ ...prev, participants: parseInt(e.target.value) }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tourType">Tour Type</Label>
              <Select value={formData.tourType} onValueChange={(value) => setFormData(prev => ({ ...prev, tourType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tour type" />
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

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="half-day">Half Day (2-4 hours)</SelectItem>
                  <SelectItem value="full-day">Full Day (6-8 hours)</SelectItem>
                  <SelectItem value="multi-day">Multi-day (2+ days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
            >
              <MapPin size={16} className="mr-2" />
              Find Tours
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToursModal;
