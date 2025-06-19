import { useState } from "react";
import { Plane, X, MapPin, Calendar, Users, CalendarIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useHomeState } from "@/hooks/useHomeState";
import FlightBookingSteps from "./flight-booking/FlightBookingSteps";
import TripSelectionStep from "./flight-booking/TripSelectionStep";
import FlightDetailsStep from "./flight-booking/FlightDetailsStep";
import ConfirmationStep from "./flight-booking/ConfirmationStep";
import MyFlightsView from "./flight-booking/MyFlightsView";
import { JollyRangeCalendar, JollyCalendar } from "@/components/ui/range-calendar";
import { parseDate, getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FlightBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface MultiCityFlight {
  from: string;
  to: string;
  departDate: string;
  passengers: number;
  class: string;
}

const FlightBookingModal = ({ isOpen, onClose }: FlightBookingModalProps) => {
  const [activeTab, setActiveTab] = useState("search");
  const [currentStep, setCurrentStep] = useState(1);
  const [tripType, setTripType] = useState<'round-trip' | 'one-way' | 'multi-city'>('round-trip');
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isDepartDateOpen, setIsDepartDateOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy'
  });
  const [multiCityFlights, setMultiCityFlights] = useState<MultiCityFlight[]>([
    { from: '', to: '', departDate: '', passengers: 1, class: 'economy' },
    { from: '', to: '', departDate: '', passengers: 1, class: 'economy' }
  ]);
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const { trips } = useHomeState();
  const { toast } = useToast();

  // Define the booking steps
  const bookingSteps = [
    { number: 1, title: "Select Trip", icon: MapPin },
    { number: 2, title: "Flight Details", icon: Plane },
    { number: 3, title: "Confirmation", icon: Calendar }
  ];

  const handleDateRangeChange = (range: { start: CalendarDate | null; end: CalendarDate | null } | null) => {
    if (range?.start && range?.end) {
      const departDate = format(new Date(range.start.year, range.start.month - 1, range.start.day), "yyyy-MM-dd");
      const returnDate = format(new Date(range.end.year, range.end.month - 1, range.end.day), "yyyy-MM-dd");
      setFormData(prev => ({
        ...prev,
        departDate,
        returnDate
      }));
      setIsDateRangeOpen(false);
    }
  };

  const handleDepartDateChange = (date: CalendarDate | null) => {
    if (date) {
      const departDate = format(new Date(date.year, date.month - 1, date.day), "yyyy-MM-dd");
      setFormData(prev => ({
        ...prev,
        departDate
      }));
      setIsDepartDateOpen(false);
    }
  };

  const getDateRangeValue = () => {
    if (formData.departDate && formData.returnDate) {
      return {
        start: parseDate(formData.departDate),
        end: parseDate(formData.returnDate)
      };
    }
    return null;
  };

  const getDepartDateValue = () => {
    if (formData.departDate) {
      return parseDate(formData.departDate);
    }
    return null;
  };

  const formatDateRange = () => {
    if (formData.departDate && formData.returnDate) {
      return `${format(new Date(formData.departDate), "dd/MM/yyyy")} - ${format(new Date(formData.returnDate), "dd/MM/yyyy")}`;
    }
    return "Seleccionar fechas del vuelo";
  };

  const formatDepartDate = () => {
    if (formData.departDate) {
      return format(new Date(formData.departDate), "dd/MM/yyyy");
    }
    return "Seleccionar fecha de salida";
  };

  const handleTripSelection = (tripId: number) => {
    setSelectedTrip(tripId);
  };

  const renderDateSelection = () => {
    if (tripType === 'round-trip') {
      return (
        <div className="space-y-2">
          <Label>Fechas del Vuelo (Ida y Vuelta)</Label>
          <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  (!formData.departDate || !formData.returnDate) && "text-muted-foreground"
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
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <Label>Fecha de Salida</Label>
          <Popover open={isDepartDateOpen} onOpenChange={setIsDepartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.departDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDepartDate()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <JollyCalendar
                value={getDepartDateValue()}
                onChange={handleDepartDateChange}
                minValue={today(getLocalTimeZone())}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TripSelectionStep 
            tripType={tripType}
            setTripType={setTripType}
            selectedTrip={selectedTrip}
            currentLocation="New York, NY"
            activeTrips={trips}
            formData={formData}
            setFormData={setFormData}
            multiCityFlights={multiCityFlights}
            setMultiCityFlights={setMultiCityFlights}
            onTripSelect={handleTripSelection}
            onContinue={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <FlightDetailsStep
            tripType={tripType}
            formData={formData}
            setFormData={setFormData}
            multiCityFlights={multiCityFlights}
            setMultiCityFlights={setMultiCityFlights}
            onBack={() => setCurrentStep(1)}
            onContinue={() => setCurrentStep(3)}
          />
        );
      case 3:
        return (
          <ConfirmationStep
            tripType={tripType}
            formData={formData}
            multiCityFlights={multiCityFlights}
            onBack={() => setCurrentStep(2)}
            onComplete={() => {
              toast({
                title: "Flight Search Started",
                description: "Finding the best flights for your trip...",
              });
              onClose();
            }}
          />
        );
      default:
        return null;
    }
  };

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
              <h2 className="text-xl font-bold">Flight Booking</h2>
              <p className="text-sm opacity-90">Find and book your perfect flight</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search Flights</TabsTrigger>
              <TabsTrigger value="my-flights">My Flights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="space-y-4 mt-4">
              <FlightBookingSteps steps={bookingSteps} activeStep={currentStep} />
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      variant={tripType === 'round-trip' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTripType('round-trip')}
                      className="flex-1"
                    >
                      Round Trip
                    </Button>
                    <Button
                      variant={tripType === 'one-way' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTripType('one-way')}
                      className="flex-1"
                    >
                      One Way
                    </Button>
                    <Button
                      variant={tripType === 'multi-city' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTripType('multi-city')}
                      className="flex-1"
                    >
                      Multi-city
                    </Button>
                  </div>
                  
                  {renderDateSelection()}
                </div>
              )}
              
              {renderStepContent()}
            </TabsContent>
            
            <TabsContent value="my-flights" className="mt-4">
              <MyFlightsView 
                onBackToOptions={() => setActiveTab("search")}
                onAddFlight={() => setActiveTab("search")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlightBookingModal;
