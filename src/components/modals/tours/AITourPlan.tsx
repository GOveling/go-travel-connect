
import { Brain, MapPin, Calendar, Camera, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AITourBookingPlan, formatTourBookingSummary, getTotalTourBudgetEstimate } from "./aiTourDateUtils";

interface AITourPlanProps {
  plan: AITourBookingPlan;
}

const AITourPlan = ({ plan }: AITourPlanProps) => {
  return (
    <div className="space-y-4">
      {/* AI Plan Header */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="text-orange-600" size={20} />
          <span className="font-semibold text-orange-800">Plan IA de Tours</span>
          <Badge variant="outline" className={`
            ${plan.aiConfidence === 'high' ? 'bg-green-100 text-green-800 border-green-300' :
              plan.aiConfidence === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
              'bg-red-100 text-red-800 border-red-300'}
          `}>
            Confianza: {plan.aiConfidence}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <p className="text-orange-700">
            <strong>Resumen:</strong> {formatTourBookingSummary(plan)}
          </p>
          <p className="text-orange-600">
            <strong>Presupuesto estimado:</strong> {getTotalTourBudgetEstimate(plan)}
          </p>
        </div>

        {plan.optimizationNotes.length > 0 && (
          <div className="mt-3 p-2 bg-white rounded border border-orange-200">
            <p className="text-xs font-medium text-orange-900 mb-1">🧠 Optimizaciones IA:</p>
            <ul className="text-xs text-orange-700 space-y-1">
              {plan.optimizationNotes.map((note, index) => (
                <li key={index}>• {note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tour Recommendations */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
          <Camera size={16} className="text-orange-600" />
          <span>Tours Recomendados por IA</span>
        </h4>
        
        {plan.recommendations.map((rec, index) => (
          <Card key={index} className="border-orange-200">
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin size={14} className="text-orange-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-gray-900">{rec.destination}</h5>
                    <p className="text-xs text-gray-600">{rec.duration} • {rec.tourType}</p>
                  </div>
                </div>
                {rec.aiOptimized && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                    IA Optimizado
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="flex items-center space-x-1 text-sm">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600">Fecha:</span>
                  <span className="font-medium text-gray-900">{rec.date}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <Users size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600">Personas:</span>
                  <span className="font-medium text-gray-900">{rec.participants}</span>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Tours sugeridos:</p>
                <div className="flex flex-wrap gap-1">
                  {rec.suggestedTours.map((tour, tourIndex) => (
                    <Badge key={tourIndex} variant="secondary" className="text-xs">
                      {tour}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                🤖 {rec.reason}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AITourPlan;
