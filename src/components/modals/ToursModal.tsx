
import { useState } from "react";
import { X, Camera } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useHomeState } from "@/hooks/useHomeState";
import TripSelectionTab from "./tours/TripSelectionTab";
import AIRecommendationsTab from "./tours/AIRecommendationsTab";
import ManualBookingTab from "./tours/ManualBookingTab";
import { TourRecommendation } from "./tours/TourAIProtocol";
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
  const [activeTab, setActiveTab] = useState("trip-selection");
  const { toast } = useToast();
  const { trips } = useHomeState();

  // Reset modal state when closing
  const handleClose = () => {
    setActiveTab("trip-selection");
    setSelectedTrip(null);
    setFormData({
      destination: '',
      date: '',
      participants: 2,
      tourType: '',
      duration: ''
    });
    onClose();
  };

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
    toast({
      title: "Viaje Seleccionado",
      description: `Datos cargados desde "${trip.name}". Usa auto-llenar para completar el formulario.`,
    });
  };

  const handleAutoFillFromTrip = (trip: Trip) => {
    setFormData(prev => ({
      ...prev,
      destination: trip.destination,
      participants: trip.travelers,
      // Use first available date from trip dates
      date: trip.dates.includes(' - ') ? 
        trip.dates.split(' - ')[0] : 
        new Date().toISOString().split('T')[0]
    }));

    // Switch to manual tab to show filled form
    setActiveTab("manual");

    toast({
      title: "Datos Auto-llenados",
      description: `Información del viaje "${trip.name}" aplicada al formulario de reserva`,
    });
  };

  const handleSwitchToAI = () => {
    setActiveTab("ai-recommendations");
  };

  const handleSelectRecommendation = (recommendation: TourRecommendation) => {
    // Auto-fill form with AI recommendation data
    setFormData(prev => ({
      ...prev,
      destination: recommendation.destinationName,
      date: recommendation.suggestedDate,
      tourType: recommendation.tourType,
      duration: recommendation.recommendedDuration === '2-3 horas' ? 'half-day' : 
               recommendation.recommendedDuration === '3-4 horas' ? 'half-day' :
               recommendation.recommendedDuration === '4-6 horas' ? 'full-day' :
               recommendation.recommendedDuration === '5-8 horas' ? 'full-day' : 'half-day'
    }));

    // Switch to manual tab to complete booking
    setActiveTab("manual");

    toast({
      title: "Recomendación de IA Aplicada",
      description: `Tour para "${recommendation.placeName}" programado para ${new Date(recommendation.suggestedDate).toLocaleDateString()}`,
    });
  };

  const handleBackToTripSelection = () => {
    setActiveTab("trip-selection");
  };

  const handleSearch = () => {
    toast({
      title: "Buscando Tours",
      description: `Encontrando experiencias guiadas increíbles para ${formData.destination}...`,
    });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
          <div className="flex items-center space-x-3 pt-2">
            <Camera size={24} />
            <div>
              <h2 className="text-xl font-bold">Tours & Experiencias</h2>
              <p className="text-sm opacity-90">Reserva con guías locales expertos</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Info Card */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Camera size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Sistema Inteligente de Tours</span>
              </div>
              <p className="text-xs text-orange-700">
                Conecta tus viajes planificados con recomendaciones de IA para reservar tours perfectos
              </p>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trip-selection" className="text-xs">Mis Viajes</TabsTrigger>
              <TabsTrigger value="ai-recommendations" className="text-xs">IA Tours</TabsTrigger>
              <TabsTrigger value="manual" className="text-xs">Manual</TabsTrigger>
            </TabsList>

            <TabsContent value="trip-selection" className="mt-4">
              <TripSelectionTab
                trips={trips}
                selectedTrip={selectedTrip}
                onTripSelect={handleTripSelect}
                onSwitchToAI={handleSwitchToAI}
                onAutoFillFromTrip={handleAutoFillFromTrip}
              />
            </TabsContent>

            <TabsContent value="ai-recommendations" className="mt-4">
              <AIRecommendationsTab
                selectedTrip={selectedTrip}
                onSelectRecommendation={handleSelectRecommendation}
                onBackToTripSelection={handleBackToTripSelection}
              />
            </TabsContent>

            <TabsContent value="manual" className="mt-4">
              <ManualBookingTab
                formData={formData}
                onFormDataChange={setFormData}
                onSearch={handleSearch}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToursModal;
