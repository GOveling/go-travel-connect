
import { useState } from "react";
import { MapPin, Calendar, Users, Clock, X, Camera } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useHomeState } from "@/hooks/useHomeState";
import TripSelectorWithAI from "./tours/TripSelectorWithAI";
import AITourPlan from "./tours/AITourPlan";
import { getAITourPlan, AITourPlan as AITourPlanType } from "./tours/aiTourUtils";

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
  const [selectedTripId, setSelectedTripId] = useState<string>('manual');
  const [aiTourPlan, setAiTourPlan] = useState<AITourPlanType | null>(null);
  const { toast } = useToast();
  const { trips } = useHomeState();

  const handleTripSelection = (tripId: string) => {
    setSelectedTripId(tripId);
    
    if (tripId === 'manual') {
      // Reset form when manual entry is selected
      setFormData({
        destination: '',
        date: '',
        participants: 2,
        tourType: '',
        duration: ''
      });
      setAiTourPlan(null);
      return;
    }

    const selectedTrip = trips.find(trip => trip.id.toString() === tripId);
    if (selectedTrip) {
      // 🤖 AI Protocol: Generate tour plan
      const aiPlan = getAITourPlan(selectedTrip);
      setAiTourPlan(aiPlan);

      // If only one recommendation, auto-fill the form
      if (aiPlan.recommendations.length === 1) {
        const rec = aiPlan.recommendations[0];
        setFormData(prev => ({
          ...prev,
          destination: rec.destination,
          date: rec.date,
          participants: rec.participants,
          tourType: rec.tourType,
          duration: rec.duration
        }));

        toast({
          title: "🤖 IA optimizó tour",
          description: `${rec.tourType} tour planificado para ${rec.destination}. ${rec.reason}`,
        });
      } else if (aiPlan.recommendations.length > 1) {
        // Clear single form for multi-destination tours
        setFormData({
          destination: '',
          date: '',
          participants: 2,
          tourType: '',
          duration: ''
        });

        toast({
          title: "🤖 IA planificó tours multi-destino",
          description: `${aiPlan.recommendations.length} tours recomendados. Confianza: ${aiPlan.aiConfidence}.`,
        });
      }
    }
  };

  const handleSearch = () => {
    if (aiTourPlan && aiTourPlan.recommendations.length > 1) {
      toast({
        title: "Buscando Tours para Todos los Destinos",
        description: `Encontrando las mejores experiencias guiadas para tus ${aiTourPlan.recommendations.length} destinos...`,
      });
    } else {
      toast({
        title: "Buscando Tours",
        description: "Encontrando experiencias guiadas increíbles para ti...",
      });
    }
    onClose();
  };

  const shouldShowManualForm = selectedTripId === 'manual' || (aiTourPlan && aiTourPlan.recommendations.length <= 1);

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
              <p className="text-sm opacity-90">IA optimiza tours según tus lugares</p>
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
                ¡Reserva tours con guías locales certificados y crea recuerdos!
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

            {/* Manual/Single Tour Form */}
            {shouldShowManualForm && (
              <>
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
                      <SelectValue placeholder="Seleccionar tipo de tour" />
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
                      <SelectValue placeholder="Seleccionar duración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="half-day">Medio Día (2-4 horas)</SelectItem>
                      <SelectItem value="full-day">Día Completo (6-8 horas)</SelectItem>
                      <SelectItem value="multi-day">Multi-día (2+ días)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
            >
              <MapPin size={16} className="mr-2" />
              {aiTourPlan && aiTourPlan.recommendations.length > 1 ? 
                `Buscar Tours para ${aiTourPlan.recommendations.length} Destinos` : 
                'Buscar Tours'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToursModal;
