
import { useState, useCallback } from 'react';
import { Trip } from "@/types";
import { getAITransportationPlan, AITransportationPlan } from "@/components/modals/transportation/aiTransportationUtils";
import { useToast } from "@/hooks/use-toast";

export const useTransportationState = (trips: Trip[]) => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    transportType: '',
    passengers: 1
  });
  const [selectedTripId, setSelectedTripId] = useState<string>('manual');
  const [aiTransportationPlan, setAiTransportationPlan] = useState<AITransportationPlan | null>(null);
  const { toast } = useToast();

  const handleTripSelection = useCallback((tripId: string) => {
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
  }, [trips, toast]);

  const updateFormData = useCallback((updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    formData,
    selectedTripId,
    aiTransportationPlan,
    handleTripSelection,
    updateFormData
  };
};
