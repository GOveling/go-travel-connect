
import { Brain, MapPin, Calendar, Bed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIHotelBookingPlan, formatHotelBookingSummary, getTotalHotelBudgetEstimate } from "./aiHotelDateUtils";

interface AIHotelPlanProps {
  plan: AIHotelBookingPlan;
}

const AIHotelPlan = ({ plan }: AIHotelPlanProps) => {
  return (
    <div className="space-y-4">
      {/* AI Plan Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="text-purple-600" size={20} />
          <span className="font-semibold text-purple-800">Plan IA de Hoteles</span>
          <Badge variant="outline" className={`
            ${plan.aiConfidence === 'high' ? 'bg-green-100 text-green-800 border-green-300' :
              plan.aiConfidence === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
              'bg-red-100 text-red-800 border-red-300'}
          `}>
            Confianza: {plan.aiConfidence}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <p className="text-purple-700">
            <strong>Resumen:</strong> {formatHotelBookingSummary(plan)}
          </p>
          <p className="text-purple-600">
            <strong>Presupuesto estimado:</strong> {getTotalHotelBudgetEstimate(plan)}
          </p>
        </div>

        {plan.optimizationNotes.length > 0 && (
          <div className="mt-3 p-2 bg-white rounded border border-purple-200">
            <p className="text-xs font-medium text-purple-900 mb-1">🧠 Optimizaciones IA:</p>
            <ul className="text-xs text-purple-700 space-y-1">
              {plan.optimizationNotes.map((note, index) => (
                <li key={index}>• {note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Hotel Recommendations */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
          <Bed size={16} className="text-blue-600" />
          <span>Reservas Recomendadas por IA</span>
        </h4>
        
        {plan.recommendations.map((rec, index) => (
          <Card key={index} className="border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin size={14} className="text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-gray-900">{rec.destination}</h5>
                    <p className="text-xs text-gray-600">{rec.nights} noches</p>
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
                  <span className="text-xs text-gray-600">Check-in:</span>
                  <span className="font-medium text-gray-900">{rec.checkIn}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600">Check-out:</span>
                  <span className="font-medium text-gray-900">{rec.checkOut}</span>
                </div>
              </div>

              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                🤖 {rec.reason}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AIHotelPlan;
