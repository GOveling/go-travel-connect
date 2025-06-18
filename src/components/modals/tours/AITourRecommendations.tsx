
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, MapPin, Clock, Star, Calendar } from "lucide-react";
import { Trip } from "@/types";
import { getAITourRecommendations, AITourPlan, TourRecommendation } from "./aiTourRecommendations";

interface AITourRecommendationsProps {
  trip: Trip;
  onSelectRecommendation: (recommendation: TourRecommendation) => void;
}

const AITourRecommendations = ({ trip, onSelectRecommendation }: AITourRecommendationsProps) => {
  const [aiPlan] = useState<AITourPlan>(() => getAITourRecommendations(trip));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTourTypeIcon = (tourType: string) => {
    switch (tourType) {
      case 'cultural': return '🏛️';
      case 'food': return '🍽️';
      case 'nature': return '🌿';
      case 'adventure': return '🏔️';
      case 'city': return '🏙️';
      case 'historical': return '📜';
      default: return '🗺️';
    }
  };

  if (aiPlan.totalRecommendations === 0) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4 text-center">
          <Brain className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-orange-700">
            No hay lugares guardados en este viaje para generar recomendaciones de tours.
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Guarda algunos lugares en tu itinerario para recibir sugerencias personalizadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Brain className="text-purple-600" size={20} />
            <span>Recomendaciones de Tours IA</span>
            <Badge className={`text-xs ${
              aiPlan.aiConfidence === 'high' ? 'bg-green-100 text-green-800' :
              aiPlan.aiConfidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Confianza: {aiPlan.aiConfidence}
            </Badge>
          </CardTitle>
          <p className="text-sm text-purple-600">
            Basado en tus {trip.savedPlaces?.length || 0} lugares guardados en "{trip.name}"
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {aiPlan.optimizationNotes.map((note, index) => (
              <p key={index} className="text-xs text-purple-700 flex items-start space-x-1">
                <span className="text-purple-500">•</span>
                <span>{note}</span>
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {aiPlan.recommendations.map((recommendation, index) => (
          <Card key={index} className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getTourTypeIcon(recommendation.suggestedTourType)}</span>
                    <h4 className="font-medium text-gray-800 text-sm">{recommendation.place.name}</h4>
                    <Badge className={`text-xs ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{recommendation.place.category}</p>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <Star size={12} className="text-yellow-500 fill-current mr-1" />
                  {recommendation.place.rating}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div className="bg-purple-50 p-2 rounded">
                  <div className="flex items-center space-x-1 mb-1">
                    <Calendar size={12} className="text-purple-600" />
                    <span className="font-medium text-purple-800">Fecha sugerida:</span>
                  </div>
                  <p className="text-purple-600">{new Date(recommendation.date).toLocaleDateString()}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <div className="flex items-center space-x-1 mb-1">
                    <Clock size={12} className="text-blue-600" />
                    <span className="font-medium text-blue-800">Duración:</span>
                  </div>
                  <p className="text-blue-600">{recommendation.suggestedDuration}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-2 rounded mb-3">
                <p className="text-xs text-gray-700">
                  <span className="font-medium">IA Recomienda:</span> {recommendation.aiReason}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <MapPin size={12} />
                  <span>{recommendation.place.destinationName}</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onSelectRecommendation(recommendation)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs px-3 py-1"
                >
                  Usar para reserva
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AITourRecommendations;
