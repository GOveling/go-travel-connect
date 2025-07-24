import { useState } from "react";
import { ChefHat, X, MapPin, Users, CalendarIcon, Clock } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { JollyCalendar } from "@/components/ui/range-calendar";
import {
  parseDate,
  getLocalTimeZone,
  today,
  CalendarDate,
} from "@internationalized/date";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RestaurantModal = ({ isOpen, onClose }: RestaurantModalProps) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    date: "",
    time: "",
    guests: 2,
    cuisine: "",
    occasion: "",
  });
  const { toast } = useToast();

  const handleDateChange = (date: CalendarDate | null) => {
    if (date) {
      const selectedDate = format(
        new Date(date.year, date.month - 1, date.day),
        "yyyy-MM-dd"
      );
      setFormData((prev) => ({
        ...prev,
        date: selectedDate,
      }));
      setIsDateOpen(false);
    }
  };

  const getDateValue = () => {
    if (formData.date) {
      return parseDate(formData.date);
    }
    return null;
  };

  const formatDate = () => {
    if (formData.date) {
      return format(new Date(formData.date), "dd/MM/yyyy");
    }
    return "Seleccionar fecha de reserva";
  };

  const handleSearch = () => {
    if (!formData.location || !formData.date) {
      toast({
        title: "Missing Information",
        description: "Please fill in location and date",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Searching Restaurants",
      description: "Finding amazing dining experiences for you...",
    });
    onClose();
  };

  const cuisineTypes = [
    "Italian",
    "French",
    "Japanese",
    "Chinese",
    "Mexican",
    "Indian",
    "Thai",
    "Mediterranean",
    "American",
    "Local Cuisine",
  ];

  const occasions = [
    "Casual Dining",
    "Fine Dining",
    "Business Lunch",
    "Romantic Dinner",
    "Family Meal",
    "Birthday Celebration",
    "Anniversary",
    "Group Gathering",
  ];

  const timeSlots = [
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
  ];

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
            <ChefHat size={24} />
            <div>
              <h2 className="text-xl font-bold">Restaurant Reservations</h2>
              <p className="text-sm opacity-90">
                Book your perfect dining experience
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ChefHat size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Premium Dining
                </span>
              </div>
              <p className="text-xs text-red-700">
                Reserve tables at top-rated restaurants and discover local
                culinary gems
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <Input
                  id="location"
                  placeholder="City or restaurant name"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Reserva</Label>
              <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <JollyCalendar
                    value={getDateValue()}
                    onChange={handleDateChange}
                    minValue={today(getLocalTimeZone())}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="relative">
                  <Clock
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <Select
                    value={formData.time}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, time: value }))
                    }
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">Guests</Label>
                <div className="relative">
                  <Users
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.guests}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        guests: parseInt(e.target.value),
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Select
                value={formData.cuisine}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, cuisine: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine type" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Select
                value={formData.occasion}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, occasion: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map((occasion) => (
                    <SelectItem key={occasion} value={occasion.toLowerCase()}>
                      {occasion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-red-500 to-red-600"
            >
              <ChefHat size={16} className="mr-2" />
              Find Restaurants
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantModal;
