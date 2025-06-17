
import { useState } from "react";
import { Car, Calendar, MapPin, Clock, X, Zap } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useHomeState } from "@/hooks/useHomeState";
import TripSelectorWithAI from "./transportation/TripSelectorWithAI";
import AITransportationPlan from "./transportation/AITransportationPlan";
import { getAITransportationPlan, AITransportationPlan as AITransportationPlanType } from "./transportation/aiTransportationUtils";

interface TransportationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransportationModal = ({ isOpen, onClose }: TransportationModalProps) => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    transportType: '',
    passengers: 1
  });
  const [selectedTripId, setSelectedTripId] = useState<string>('manual');
  const [aiTransportationPlan, setAiTransportationPlan] = useState<AITransportationPlanType | null>(null);
  const { toast } = useToast();
  const { trips } = useHomeState();

  const handleTripSelection = (tripId: string) => {
    setSelectedTripId(tripId);
    
    if (tripId === 'manual') {
      // Reset form when manual entry is selected
      setFormData({
        origin: '',
        destination: '',
        date: '',
        transportType: '',
        passengers: 1
      });
      setAiTransportationPlan(null);
      return;
    }

    const selectedTrip = trips.find(trip => trip.id.toString() === tripId);
    if (selectedTrip) {
      // 🤖 AI Protocol: Generate transportation plan
      const aiPlan = getAITransportationPlan(selectedTrip);
      setAiTransportationPlan(aiPlan);

      // If only one recommendation, auto-fill the form
      if (aiPlan.recommendations.length === 1) {
        const rec = aiPlan.recommendations[0];
        setFormData(prev => ({
          ...prev,
          destination: rec.destination,
          date: rec.date,
          transportType: rec.transportType,
          passengers: selectedTrip.travelers || 1
        }));

        toast({
          title: "🤖 IA optimizó transporte",
          description: `${rec.transportType} planificado para ${rec.destination}. ${rec.reason}`,
        });
      } else if (aiPlan.recommendations.length > 1) {
        // Clear single form for multi-destination transportation
        setFormData({
          origin: '',
          destination: '',
          date: '',
          transportType: '',
          passengers: selectedTrip.travelers || 1
        });

        toast({
          title: "🤖 IA planificó transportes multi-destino",
          description: `${aiPlan.recommendations.length} transportes recomendados. Confianza: ${aiPlan.aiConfidence}.`,
        });
      }
    }
  };

  const handleSearch = () => {
    if (aiTransportationPlan && aiTransportationPlan.recommendations.length > 1) {
      toast({
        title: "Buscando Transportes para Todos los Destinos",
        description: `Encontrando las mejores opciones de transporte para tus ${aiTransportationPlan.recommendations.length} conexiones...`,
      });
    } else {
      toast({
        title: "Buscando Transportes",
        description: "Encontrando las mejores opciones de transporte para tu viaje...",
      });
    }
    onClose();
  };

  const shouldShowManualForm = selectedTripId === 'manual' || (aiTransportationPlan && aiTransportationPlan.recommendations.length <= 1);

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
            <Car size={24} />
            <div>
              <h2 className="text-xl font-bold">Transportes</h2>
              <p className="text-sm opacity-90">IA sugiere opciones según tu itinerario</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">IA Inteligente</span>
              </div>
              <p className="text-xs text-blue-700">
                ¡Opciones automáticas: vuelos, trenes, taxis, car rental y más!
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <TripSelectorWithAI 
              selectedTripId={selectedTripId}
              trips={trips}
              onTripSelection={handleTripSelection}
            />

            {/* AI Transportation Plan Display */}
            {aiTransportationPlan && selectedTripId !== 'manual' && (
              <AITransportationPlan plan={aiTransportationPlan} />
            )}

            {/* Manual/Single Transportation Form */}
            {shouldShowManualForm && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="origin">Origen</Label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="origin"
                      placeholder="Ciudad o lugar de partida"
                      value={formData.origin}
                      onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="destination"
                      placeholder="Ciudad o lugar de destino"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha de Viaje</Label>
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
                  <Label htmlFor="transportType">Tipo de Transporte</Label>
                  <Select value={formData.transportType} onValueChange={(value) => setFormData(prev => ({ ...prev, transportType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar transporte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flight">✈️ Vuelo</SelectItem>
                      <SelectItem value="train">🚄 Tren</SelectItem>
                      <SelectItem value="bus">🚌 Autobús</SelectItem>
                      <SelectItem value="ferry">⛴️ Ferry</SelectItem>
                      <SelectItem value="car-rental">🚗 Car Rental</SelectItem>
                      <SelectItem value="taxi">🚕 Taxi</SelectItem>
                      <SelectItem value="uber">🚗 Uber</SelectItem>
                      <SelectItem value="metro">🚇 Metro/Subway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengers">Pasajeros</Label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                    <Input
                      id="passengers"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.passengers}
                      onChange={(e) => setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}

            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
            >
              <Car size={16} className="mr-2" />
              {aiTransportationPlan && aiTransportationPlan.recommendations.length > 1 ? 
                `Buscar Transportes para ${aiTransportationPlan.recommendations.length} Conexiones` : 
                'Buscar Transportes'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransportationModal;
