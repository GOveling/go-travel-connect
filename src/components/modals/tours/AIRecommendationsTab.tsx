
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, MapPin, Clock, Calendar, Star, DollarSign } from "lucide-react";
import { Trip } from "@/types";
import { 
  generateTourRecommendations, 
  TourAIPlan, 
  TourRecommendation,
  getTourTypeIcon,
  getPriorityColor 
} from "./TourAIProtocol";

interface AIRecommendationsTabProps {
  selectedTrip: Trip | null;
  onSelectRecommendation: (recommendation: TourRecommendation) => void;
  onBackToTripSelection: () => void;
}

const AIRecommendationsTab = ({ 
  selectedTrip, 
  onSelectRecommendation,
  onBackToTripSelection 
}: AIRecommendationsTabProps) => {
  const [aiPlan, setAiPlan] = useState<TourAIPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (selectedTrip) {
      setIsGenerating(true);
      // Simulate AI processing time
      setTimeout(() => {
        const plan = generateTourRecommendations(selectedTrip);
        setAiPlan(plan);
        setIsGenerating(false);
      }, 1500);
    }
  }, [selectedTrip]);

  if (!selectedTrip) {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4 text-center">
          <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-purple-700 mb-2">
            Selecciona un viaje primero para generar recomendaciones de IA
          </p>
          <Button 
            variant="outline" 
            onClick={onBackToTripSelection}
            className="text-xs border-purple-300 text-purple-600 hover:bg-purple-100"
          >
            Seleccionar Viaje
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-4 text-center">
          <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-purple-700">
            Analizando tu itinerario de IA Smart Route...
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Generando recomendaciones personalizadas de tours
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!aiPlan || aiPlan.totalRecommendations === 0) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4 text-center">
          <Brain className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-orange-700 mb-2">
            No se encontraron lugares guardados en este viaje
          </p>
          <p className="text-xs text-orange-600 mb-3">
            Agrega lugares a tu itinerario en "My Trips" para recibir recomendaciones de tours
          </p>
          <Button 
            variant="outline" 
            onClick={onBackToTripSelection}
            className="text-xs border-orange-300 text-orange-600 hover:bg-orange-100"
          >
            Seleccionar Otro Viaje
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Plan Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Brain className="text-purple-600" size={20} />
            <span>Tours Recomendados por IA</span>
            <Badge className={`text-xs ${
              aiPlan.confidence === 'high' ? 'bg-green-100 text-green-800' :
              aiPlan.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Confianza: {aiPlan.confidence}
            </Badge>
          </CardTitle>
          <p className="text-sm text-purple-600">
            Basado en {selectedTrip.savedPlaces?.length || 0} lugares guardados en "{selectedTrip.name}"
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

      {/* Tour Recommendations */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {aiPlan.recommendations.map((recommendation, index) => (
          <Card key={recommendation.id} className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getTourTypeIcon(recommendation.tourType)}</span>
                    <h4 className="font-medium text-gray-800 text-sm">{recommendation.placeName}</h4>
                    <Badge className={`text-xs ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{recommendation.placeCategory}</p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <DollarSign size={12} className="text-green-600" />
                  <span className="text-green-600 font-medium">{recommendation.estimatedPrice}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="flex items-center space-x-1 mb-1">
                    <Calendar size={12} className="text-blue-600" />
                    <span className="font-medium text-blue-800">Fecha:</span>
                  </div>
                  <p className="text-blue-600">{new Date(recommendation.suggestedDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="flex items-center space-x-1 mb-1">
                    <Clock size={12} className="text-purple-600" />
                    <span className="font-medium text-purple-800">Hora:</span>
                  </div>
                  <p className="text-purple-600">{recommendation.suggestedTime}</p>
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
                  <span>{recommendation.destinationName}</span>
                  <span>•</span>
                  <Clock size={12} />
                  <span>{recommendation.recommendedDuration}</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onSelectRecommendation(recommendation)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs px-3 py-1"
                >
                  Reservar Tour
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendationsTab;
