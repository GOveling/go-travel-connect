
import { useState } from "react";
import { MapPin, Users, X, Camera, CalendarIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useHomeState } from "@/hooks/useHomeState";
import TripSelectorWithAI from "./tours/TripSelectorWithAI";
import MultiDestinationTourBooking from "./tours/MultiDestinationTourBooking";
import AITourPlan from "./tours/AITourPlan";
import { getAITourBookingPlan, AITourBookingPlan } from "./tours/aiTourDateUtils";
import { JollyRangeCalendar } from "@/components/ui/range-calendar";
import { parseDate, getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ToursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DestinationTourBooking {
  destination: string;
  startDate: string;
  endDate: string;
  duration: string;
  tourType: string;
  participants: number;
}

const ToursModal = ({ isOpen, onClose }: ToursModalProps) => {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    participants: 2,
    tourType: '',
    duration: ''
  });
  const [selectedTripId, setSelectedTripId] = useState<string>('manual');
  const [multiDestinationBookings, setMultiDestinationBookings] = useState<DestinationTourBooking[]>([]);
  const [isMultiDestination, setIsMultiDestination] = useState(false);
  const [aiTourPlan, setAiTourPlan] = useState<AITourBookingPlan | null>(null);
  const { toast } = useToast();
  const { trips } = useHomeState();

  const handleTripSelection = (tripId: string) => {
    setSelectedTripId(tripId);
    
    if (tripId === 'manual') {
      // Reset form when manual entry is selected
      setFormData({
        destination: '',
        startDate: '',
        endDate: '',
        participants: 2,
        tourType: '',
        duration: ''
      });
      setMultiDestinationBookings([]);
      setIsMultiDestination(false);
      setAiTourPlan(null);
      return;
    }

    const selectedTrip = trips.find(trip => trip.id.toString() === tripId);
    if (selectedTrip) {
      // 🤖 AI Protocol: Generate tour booking plan
      const aiPlan = getAITourBookingPlan(selectedTrip);
      setAiTourPlan(aiPlan);

      // Check if trip has multiple destinations using coordinates
      const destinations = selectedTrip.coordinates || [];
      const isMultiDest = destinations.length > 1;
      
      setIsMultiDestination(isMultiDest);

      if (isMultiDest) {
        // Handle multi-destination trip with AI recommendations
        const bookings: DestinationTourBooking[] = aiPlan.recommendations.map((rec) => ({
          destination: rec.destination,
          startDate: rec.date,
          endDate: rec.date, // Single day by default
          duration: rec.duration,
          tourType: rec.tourType,
          participants: rec.participants
        }));

        setMultiDestinationBookings(bookings);
        
        // Clear single destination form
        setFormData({
          destination: '',
          startDate: '',
          endDate: '',
          participants: 2,
          tourType: '',
          duration: ''
        });

        // Show AI automation toast for multi-destination
        toast({
          title: "🤖 IA optimizó tours multi-destino",
          description: `${aiPlan.recommendations.length} tours planificados. Confianza: ${aiPlan.aiConfidence}.`,
        });
      } else if (aiPlan.recommendations.length === 1) {
        // Handle single destination trip with AI optimization
        const rec = aiPlan.recommendations[0];
        
        setFormData(prev => ({
          ...prev,
          destination: rec.destination,
          startDate: rec.date,
          endDate: rec.date, // Single day by default
          participants: rec.participants,
          tourType: rec.tourType,
          duration: rec.duration
        }));
        
        setMultiDestinationBookings([]);

        // Show AI automation toast
        toast({
          title: "🤖 IA optimizó tour",
          description: `${rec.duration} en ${rec.destination}. ${rec.reason}`,
        });
      }
    }
  };

  const updateMultiDestinationBooking = (index: number, field: keyof DestinationTourBooking, value: string | number) => {
    setMultiDestinationBookings(prev => 
      prev.map((booking, i) => 
        i === index ? { ...booking, [field]: value } : booking
      )
    );
  };

  const handleDateRangeChange = (range: { start: CalendarDate | null; end: CalendarDate | null } | null) => {
    if (range?.start && range?.end) {
      const startDate = format(new Date(range.start.year, range.start.month - 1, range.start.day), "yyyy-MM-dd");
      const endDate = format(new Date(range.end.year, range.end.month - 1, range.end.day), "yyyy-MM-dd");
      setFormData(prev => ({
        ...prev,
        startDate,
        endDate
      }));
      setIsDateRangeOpen(false);
    }
  };

  const getDateRangeValue = () => {
    if (formData.startDate && formData.endDate) {
      return {
        start: parseDate(formData.startDate),
        end: parseDate(formData.endDate)
      };
    }
    return null;
  };

  const formatDateRange = () => {
    if (formData.startDate && formData.endDate) {
      return `${format(new Date(formData.startDate), "dd/MM/yyyy")} - ${format(new Date(formData.endDate), "dd/MM/yyyy")}`;
    }
    return "Seleccionar fechas del tour";
  };

  const handleSearch = () => {
    if (isMultiDestination) {
      toast({
        title: "Buscando Tours para Todos los Destinos",
        description: `Encontrando las mejores experiencias para tus ${multiDestinationBookings.length} destinos...`,
      });
    } else {
      toast({
        title: "Searching Tours",
        description: "Finding amazing guided experiences for you...",
      });
    }
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
              <h2 className="text-xl font-bold">Tours & Experiencias</h2>
              <p className="text-sm opacity-90">IA optimiza tus aventuras guiadas</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Camera size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Expertos Locales</span>
              </div>
              <p className="text-xs text-orange-700">
                Reserva tours con guías locales certificados y crea recuerdos!
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <TripSelectorWithAI 
              selectedTripId={selectedTripId}
              trips={trips}
              onTripSelection={handleTripSelection}
            />

            {/* AI Tour Plan Display */}
            {aiTourPlan && selectedTripId !== 'manual' && (
              <AITourPlan plan={aiTourPlan} />
            )}

            {/* Multi-destination bookings */}
            {isMultiDestination && multiDestinationBookings.length > 0 && (
              <MultiDestinationTourBooking 
                bookings={multiDestinationBookings}
                onUpdateBooking={updateMultiDestinationBooking}
              />
            )}

            {/* Single destination form (only show when not multi-destination) */}
            {!isMultiDestination && (
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
                  <Label>Fechas del Tour</Label>
                  <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                    <PopoverTrigger asChild>
                      <Button
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
                      value={form.participants}
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
              </div>
            )}

            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
            >
              <MapPin size={16} className="mr-2" />
              {isMultiDestination ? `Buscar Tours para ${multiDestinationBookings.length} Destinos` : 'Find Tours'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToursModal;
