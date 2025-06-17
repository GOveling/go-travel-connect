
import { useState } from "react";
import { Car, Train, Plane, MapPin, Calendar, Clock, X, Users } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface TransportationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransportationModal = ({ isOpen, onClose }: TransportationModalProps) => {
  const [selectedTransport, setSelectedTransport] = useState('');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '10:00',
    passengers: 1,
    returnDate: '',
    returnTime: '10:00'
  });
  const { toast } = useToast();

  const transportationOptions = [
    {
      id: 'car-rental',
      name: 'Car Rental',
      icon: Car,
      description: 'Rent a car for flexibility',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'airport-van',
      name: 'Airport Van',
      icon: Plane,
      description: 'Shared shuttle service',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'train',
      name: 'Train',
      icon: Train,
      description: 'Comfortable rail travel',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'taxi',
      name: 'Taxi',
      icon: Car,
      description: 'Private taxi service',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'uber',
      name: 'Uber/Lyft',
      icon: Car,
      description: 'Rideshare services',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      id: 'metro',
      name: 'Metro/Bus',
      icon: Train,
      description: 'Public transportation',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  const selectedOption = transportationOptions.find(option => option.id === selectedTransport);

  const handleSearch = () => {
    if (!selectedTransport) {
      toast({
        title: "Please select a transportation option",
        description: "Choose your preferred way to travel",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Searching Transportation",
      description: `Finding ${selectedOption?.name} options for your trip...`,
    });
    onClose();
  };

  const renderTransportationGrid = () => (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {transportationOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedTransport === option.id;
        
        return (
          <Card 
            key={option.id}
            className={`cursor-pointer transition-all duration-200 border-2 ${
              isSelected 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            } ${option.bgColor}`}
            onClick={() => setSelectedTransport(option.id)}
          >
            <CardContent className="p-3 text-center">
              <div className={`w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="font-medium text-sm text-gray-800 mb-1">{option.name}</h3>
              <p className="text-xs text-gray-600">{option.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderBookingForm = () => {
    if (!selectedTransport) return null;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="from">From</Label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
            <Input
              id="from"
              placeholder="Departure location"
              value={formData.from}
              onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
            <Input
              id="to"
              placeholder="Destination"
              value={formData.to}
              onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="date">Departure Date</Label>
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

        {(selectedTransport === 'car-rental' || selectedTransport === 'taxi' || selectedTransport === 'uber') && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="returnDate">Return Date</Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnTime">Return Time</Label>
                <Input
                  id="returnTime"
                  type="time"
                  value={formData.returnTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, returnTime: e.target.value }))}
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="passengers">Passengers</Label>
          <div className="relative">
            <Users size={16} className="absolute left-3 top-3 text-gray-400" />
            <Input
              id="passengers"
              type="number"
              min="1"
              max="8"
              value={formData.passengers}
              onChange={(e) => setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
              className="pl-10"
            />
          </div>
        </div>

        <Button 
          onClick={handleSearch}
          className={`w-full bg-gradient-to-r ${selectedOption?.color}`}
        >
          <Car size={16} className="mr-2" />
          Search {selectedOption?.name}
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white relative">
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
              <h2 className="text-xl font-bold">Transportation</h2>
              <p className="text-sm opacity-90">Choose your preferred travel option</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Multiple Options</span>
              </div>
              <p className="text-xs text-blue-700">
                Compare prices and book your preferred transportation method
              </p>
            </CardContent>
          </Card>

          {renderTransportationGrid()}
          {renderBookingForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransportationModal;
