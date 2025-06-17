import { Brain, MapPin, Calendar, Users, Clock, Car, Plane, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AITransportationPlan as AITransportationPlanType } from "./aiTransportationUtils";
import { formatTransportationSummary, getTransportationBudgetEstimate } from "./aiTransportationUtils";

interface AITransportationPlanProps {
  plan: AITransportationPlanType;
}

const AITransportationPlan = ({ plan }: AITransportationPlanProps) => {
  const getTransportTypeDisplayName = (transportType: string) => {
    const types = {
      'flight': '✈️ Vuelo',
      'train': '🚄 Tren',
      'bus': '🚌 Autobús',
      'ferry': '⛴️ Ferry',
      'car-rental': '🚗 Car Rental',
      'taxi': '🚕 Taxi',
      'uber': '🚗 Uber',
      'metro': '🚇 Metro/Subway',
      'airport-shuttle': '🚐 Shuttle Aeropuerto'
    };
    return types[transportType as keyof typeof types] || '🚗 Transporte';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'airport-arrival':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'inter-destination':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'local-transport':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'airport-departure':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'home-return':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categories = {
      'airport-arrival': '🛬 Llegada Aeropuerto',
      'inter-destination': '🗺️ Entre Destinos',
      'local-transport': '🏙️ Transporte Local',
      'airport-departure': '🛫 Salida Aeropuerto',
      'home-return': '🏠 Retorno Casa'
    };
    return categories[category as keyof typeof categories] || 'Transporte';
  };

  const getBookingStatusBadge = (bookingRequired: boolean) => {
    if (bookingRequired) {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">
          Reserva Requerida
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
          Sin Reserva
        </Badge>
      );
    }
  };

  // Group recommendations by category
  const groupedRecommendations = plan.recommendations.reduce((groups, rec) => {
    const category = rec.transportCategory || 'local-transport';
    if (!groups[category]) groups[category] = [];
    groups[category].push(rec);
    return groups;
  }, {} as Record<string, typeof plan.recommendations>);

  return (
    <div className="space-y-4">
      {/* AI Plan Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="text-blue-600" size={20} />
          <span className="font-semibold text-blue-800">Plan IA de Transportes Completo</span>
          <Badge variant="outline" className={`
            ${plan.aiConfidence === 'high' ? 'bg-green-100 text-green-800 border-green-300' :
              plan.aiConfidence === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
              'bg-red-100 text-red-800 border-red-300'}
          `}>
            Confianza: {plan.aiConfidence}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <p className="text-blue-700">
            <strong>Resumen:</strong> {formatTransportationSummary(plan)}
          </p>
          <p className="text-blue-600">
            <strong>Presupuesto estimado:</strong> {getTransportationBudgetEstimate(plan)}
          </p>
        </div>

        {/* Journey Map Summary */}
        <div className="mt-3 p-3 bg-white rounded border border-blue-200">
          <p className="text-xs font-medium text-blue-900 mb-2">🗺️ Mapa del Viaje Completo:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Plane size={12} className="text-blue-600" />
              <span className="text-blue-700">Aeropuertos: {plan.fullJourneyMap.airportArrivals + plan.fullJourneyMap.airportDepartures}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin size={12} className="text-purple-600" />
              <span className="text-purple-700">Conexiones: {plan.fullJourneyMap.interDestinationTransports}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Car size={12} className="text-green-600" />
              <span className="text-green-700">Locales: {plan.fullJourneyMap.localTransports}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Home size={12} className="text-pink-600" />
              <span className="text-pink-700">Casa: {plan.fullJourneyMap.homeReturn ? 'Incluido' : 'No'}</span>
            </div>
          </div>
        </div>

        {plan.optimizationNotes.length > 0 && (
          <div className="mt-3 p-2 bg-white rounded border border-blue-200">
            <p className="text-xs font-medium text-blue-900 mb-1">🧠 Optimizaciones IA:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              {plan.optimizationNotes.map((note, index) => (
                <li key={index}>• {note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Transportation Recommendations by Category */}
      <div className="space-y-4">
        {Object.entries(groupedRecommendations).map(([category, recommendations]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <Badge variant="outline" className={`${getCategoryColor(category)}`}>
                {getCategoryDisplayName(category)}
              </Badge>
              <span className="text-sm text-gray-600">({recommendations.length} transportes)</span>
            </h4>
            
            {recommendations.map((rec, index) => (
              <Card key={index} className="border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin size={14} className="text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-gray-900">{rec.route}</h5>
                        <p className="text-xs text-gray-600">{getTransportTypeDisplayName(rec.transportType)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {rec.aiOptimized && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                          IA Optimizado
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(rec.priority)}`}>
                        Prioridad: {rec.priority}
                      </Badge>
                      {getBookingStatusBadge(rec.bookingRequired)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="flex items-center space-x-1 text-sm">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-600">Fecha:</span>
                      <span className="font-medium text-gray-900">{rec.date}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-600">Duración:</span>
                      <span className="font-medium text-gray-900">{rec.estimatedDuration}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-sm mb-2">
                    <span className="text-xs text-gray-600">Costo estimado:</span>
                    <span className="font-medium text-gray-900">{rec.estimatedCost}</span>
                  </div>

                  {rec.relatedPlaces.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 mb-1">Lugares relacionados:</p>
                      <div className="flex flex-wrap gap-1">
                        {rec.relatedPlaces.slice(0, 3).map((place, placeIndex) => (
                          <Badge key={placeIndex} variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-300">
                            {place}
                          </Badge>
                        ))}
                        {rec.relatedPlaces.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                            +{rec.relatedPlaces.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    🤖 {rec.reason}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AITransportationPlan;
