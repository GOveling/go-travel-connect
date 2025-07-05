import { useState } from "react";
import { Calendar, Plane, CalendarIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { JollyRangeCalendar } from "@/components/ui/range-calendar";
import { parseDate, getLocalTimeZone, today, CalendarDate } from "@internationalized/date";

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (tripData: any) => void;
}

const NewTripModal = ({ isOpen, onClose, onCreateTrip }: NewTripModalProps) => {
  const { toast } = useToast();
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isAccommodationOpen, setIsAccommodationOpen] = useState(false);
  const [isTransportationOpen, setIsTransportationOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    budget: 0,
    description: "",
    accommodation: [] as string[],
    transportation: [] as string[],
    datesNotSet: false
  });

  const accommodationOptions = [
    "Hotels",
    "Hostels", 
    "Vacation Rentals",
    "Bed & Breakfast",
    "Resorts",
    "Apartments",
    "Guesthouses",
    "Camping",
    "Motels"
  ];

  const transportationOptions = [
    "Flights",
    "Train",
    "Car Rental",
    "Bus",
    "Taxi/Rideshare",
    "Metro/Subway",
    "Walking",
    "Bicycle",
    "Ferry",
    "Motorcycle"
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (range: { start: CalendarDate | null; end: CalendarDate | null } | null) => {
    if (range?.start && range?.end) {
      const startDate = new Date(range.start.year, range.start.month - 1, range.start.day);
      const endDate = new Date(range.end.year, range.end.month - 1, range.end.day);
      setFormData(prev => ({
        ...prev,
        startDate,
        endDate,
        datesNotSet: false
      }));
      setIsDateRangeOpen(false);
    } else if (range?.start) {
      const startDate = new Date(range.start.year, range.start.month - 1, range.start.day);
      setFormData(prev => ({
        ...prev,
        startDate,
        endDate: undefined,
        datesNotSet: false
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        startDate: undefined,
        endDate: undefined
      }));
    }
  };

  const getDateRangeValue = () => {
    if (formData.startDate && formData.endDate) {
      return {
        start: parseDate(format(formData.startDate, "yyyy-MM-dd")),
        end: parseDate(format(formData.endDate, "yyyy-MM-dd"))
      };
    } else if (formData.startDate) {
      return {
        start: parseDate(format(formData.startDate, "yyyy-MM-dd")),
        end: null
      };
    }
    return null;
  };

  const formatDateRange = () => {
    if (formData.startDate && formData.endDate) {
      return `${format(formData.startDate, "dd/MM/yyyy")} - ${format(formData.endDate, "dd/MM/yyyy")}`;
    } else if (formData.startDate) {
      return `${format(formData.startDate, "dd/MM/yyyy")} - Seleccionar fin`;
    }
    return "Seleccionar fechas del viaje";
  };

  const handleNotSureYet = () => {
    setFormData(prev => ({
      ...prev,
      startDate: undefined,
      endDate: undefined,
      datesNotSet: true
    }));
  };

  const formatTripDates = () => {
    if (formData.datesNotSet) {
      return "Dates TBD";
    }
    if (formData.startDate && formData.endDate) {
      const startFormatted = format(formData.startDate, "MMM d, yyyy");
      const endFormatted = format(formData.endDate, "MMM d, yyyy");
      return `${startFormatted} - ${endFormatted}`;
    }
    return "Dates TBD";
  };

  const handleAccommodationSelect = (value: string) => {
    if (!formData.accommodation.includes(value)) {
      setFormData(prev => ({
        ...prev,
        accommodation: [...prev.accommodation, value]
      }));
    }
  };

  const handleTransportationSelect = (value: string) => {
    if (!formData.transportation.includes(value)) {
      setFormData(prev => ({
        ...prev,
        transportation: [...prev.transportation, value]
      }));
    }
  };

  const removeAccommodation = (item: string) => {
    setFormData(prev => ({
      ...prev,
      accommodation: prev.accommodation.filter(a => a !== item)
    }));
  };

  const removeTransportation = (item: string) => {
    setFormData(prev => ({
      ...prev,
      transportation: prev.transportation.filter(t => t !== item)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in the trip name.",
        variant: "destructive"
      });
      return;
    }

    const newTrip = {
      id: Date.now(),
      name: formData.name,
      destination: "To be defined",
      dates: formatTripDates(),
      status: "planning",
      travelers: 1,
      image: "🌍",
      isGroupTrip: false,
      description: formData.description,
      budget: formData.budget.toString(),
      accommodation: formData.accommodation.join(", "),
      transportation: formData.transportation.join(", "),
      coordinates: [],
      datesNotSet: formData.datesNotSet
    };

    onCreateTrip(newTrip);
    
    toast({
      title: "Trip Created!",
      description: `${formData.name} has been added to your trips.`
    });

    // Reset form
    setFormData({
      name: "",
      startDate: undefined,
      endDate: undefined,
      budget: 0,
      description: "",
      accommodation: [],
      transportation: [],
      datesNotSet: false
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
            <Plane className="text-blue-600" size={20} />
            <span>Create New Trip</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 px-1">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
            
            <div>
              <Label htmlFor="tripName" className="text-sm font-medium">
                Trip Name *
              </Label>
              <Input
                id="tripName"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., European Adventure"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Tell us about your trip plans..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Calendar size={16} />
                Travel Dates
              </Label>
              
              {formData.datesNotSet ? (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-2">Dates will be decided later</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange("datesNotSet", false)}
                    className="text-blue-600 border-blue-300"
                  >
                    Set Dates Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          (!formData.startDate || !formData.endDate) && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formatDateRange()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <JollyRangeCalendar
                        value={getDateRangeValue()}
                        onChange={handleDateRangeChange}
                        minValue={today(getLocalTimeZone())}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleNotSureYet}
                    className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    Not sure yet
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Trip Details</h3>
            
            <div>
              <Label htmlFor="budget" className="text-sm font-medium">
                Budget (optional)
              </Label>
              <Input
                id="budget"
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Accommodation Preferences (optional)
              </Label>
              <Popover open={isAccommodationOpen} onOpenChange={setIsAccommodationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    {formData.accommodation.length > 0
                      ? `${formData.accommodation.length} selected`
                      : "Select accommodation types"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <div className="p-3 space-y-2">
                    {accommodationOptions.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={formData.accommodation.includes(option) ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          if (formData.accommodation.includes(option)) {
                            removeAccommodation(option);
                          } else {
                            handleAccommodationSelect(option);
                          }
                        }}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {formData.accommodation.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.accommodation.map((item) => (
                    <Badge key={item} variant="secondary" className="flex items-center gap-1">
                      {item}
                      <X 
                        size={14} 
                        className="cursor-pointer hover:text-red-500" 
                        onClick={() => removeAccommodation(item)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">
                Transportation (optional)
              </Label>
              <Popover open={isTransportationOpen} onOpenChange={setIsTransportationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    {formData.transportation.length > 0
                      ? `${formData.transportation.length} selected`
                      : "Select transportation types"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <div className="p-3 space-y-2">
                    {transportationOptions.map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={formData.transportation.includes(option) ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          if (formData.transportation.includes(option)) {
                            removeTransportation(option);
                          } else {
                            handleTransportationSelect(option);
                          }
                        }}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {formData.transportation.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.transportation.map((item) => (
                    <Badge key={item} variant="secondary" className="flex items-center gap-1">
                      {item}
                      <X 
                        size={14} 
                        className="cursor-pointer hover:text-red-500" 
                        onClick={() => removeTransportation(item)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500"
            >
              Create Trip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTripModal;