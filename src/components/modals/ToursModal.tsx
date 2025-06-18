
import { useState } from "react";
import { MapPin, Calendar, Users, Clock, X, Camera } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useHomeState } from "@/hooks/useHomeState";
import TripSelector from "./tours/TripSelector";
import AITourRecommendations from "./tours/AITourRecommendations";
import { TourRecommendation } from "./tours/aiTourRecommendations";
import type { Trip } from "@/types";

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
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState("manual");
  const { toast } = useToast();
  const { trips } = useHomeState();

  const handleSearch = () => {
    toast({
      title: "Buscando Tours",
      description: `Encontrando experiencias guiadas increíbles para ${formData.destination}...`,
    });
    onClose();
  };

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
    
    // Auto-fill form data based on selected trip
    setFormData(prev => ({
      ...prev,
      destination: trip.destination,
      participants: trip.travelers
    }));

    // Switch to AI recommendations tab if trip has saved places
    if (trip.savedPlaces && trip.savedPlaces.length > 0) {
      setActiveTab("ai-recommendations");
    }

    toast({
      title: "Viaje Seleccionado",
      description: `Datos cargados automáticamente desde "${trip.name}"`,
    });
  };

  const handleRecommendationSelect = (recommendation: TourRecommendation) => {
    // Auto-fill form with recommendation data
    setFormData(prev => ({
      ...prev,
      destination: recommendation.place.destinationName,
      date: recommendation.date,
      tourType: recommendation.suggestedTourType,
      duration: recommendation.suggestedDuration
    }));

    // Switch to manual tab to show filled form
    setActiveTab("manual");

    toast({
      title: "Recomendación Aplicada",
      description: `Datos del tour para "${recommendation.place.name}" cargados automáticamente`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto p-0">
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
              <p className="text-sm opacity-90">Descubre aventuras guiadas</p>
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
                Reserva tours con guías locales certificados y crea recuerdos increíbles!
              </p>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trip-select" className="text-xs">Mis Viajes</TabsTrigger>
              <TabsTrigger value="ai-recommendations" className="text-xs">IA Tours</TabsTrigger>
              <TabsTrigger value="manual" className="text-xs">Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="trip-select" className="mt-4">
              <TripSelector
                trips={trips}
                selectedTrip={selectedTrip}
                onTripSelect={handleTripSelect}
              />
            </TabsContent>

            <TabsContent value="ai-recommendations" className="mt-4">
              {selectedTrip ? (
                <AITourRecommendations
                  trip={selectedTrip}
                  onSelectRecommendation={handleRecommendationSelect}
                />
              ) : (
                <Card className="border-gray-200 bg-gray-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600">
                      Selecciona un viaje primero para ver las recomendaciones de IA
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab("trip-select")}
                      className="mt-2 text-xs"
                    >
                      Seleccionar Viaje
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="manual" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="destination"
                      placeholder="¿Dónde quieres explorar?"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha del Tour</Label>
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
                  <Label htmlFor="participants">Participantes</Label>
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
                  <Label htmlFor="tourType">Tipo de Tour</Label>
                  <Select value={formData.tourType} onValueChange={(value) => setFormData(prev => ({ ...prev, tourType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo de tour" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="city">Tours de Ciudad</SelectItem>
                      <SelectItem value="cultural">Tours Culturales</SelectItem>
                      <SelectItem value="food">Tours Gastronómicos</SelectItem>
                      <SelectItem value="adventure">Tours de Aventura</SelectItem>
                      <SelectItem value="historical">Tours Históricos</SelectItem>
                      <SelectItem value="nature">Tours de Naturaleza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duración</Label>
                  <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona duración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="half-day">Medio Día (2-4 horas)</SelectItem>
                      <SelectItem value="full-day">Día Completo (6-8 horas)</SelectItem>
                      <SelectItem value="multi-day">Múltiples días (2+ días)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
                  disabled={!formData.destination || !formData.date}
                >
                  <MapPin size={16} className="mr-2" />
                  Buscar Tours
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToursModal;
