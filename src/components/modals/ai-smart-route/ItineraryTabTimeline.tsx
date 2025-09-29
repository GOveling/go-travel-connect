import React from "react";
import { Calendar, Clock, Navigation, Star, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DayItinerary, RouteConfiguration } from "@/types/aiSmartRoute";
import { getPriorityColor } from "@/utils/aiSmartRoute";
import TransferBlock from "./TransferBlock";
import FreeTimeBlock from "./FreeTimeBlock";
import AccommodationBase from "./AccommodationBase";
import OptimizationMetrics from "./OptimizationMetrics";
import RouteSegment from "@/components/ui/RouteSegment";
import type { OptimizationMetrics as OptimizationMetricsType } from "@/types/aiSmartRouteApi";

interface ItineraryTabTimelineProps {
  optimizedItinerary: DayItinerary[];
  selectedRouteType: string;
  routeConfigurations: { [key: string]: RouteConfiguration };
  totalSavedPlaces: number;
  totalTripDays: number;
  onRouteTypeChange: (routeType: string) => void;
  optimizationMetrics?: OptimizationMetricsType | null;
  apiRecommendations?: string[];
}

const ItineraryTabTimeline = ({
  optimizedItinerary,
  selectedRouteType,
  routeConfigurations,
  totalSavedPlaces,
  totalTripDays,
  onRouteTypeChange,
  optimizationMetrics,
  apiRecommendations = [],
}: ItineraryTabTimelineProps) => {
  return (
    <div className="space-y-6 mt-4 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 sm:p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center text-sm sm:text-base">
            <span className="mr-2">🧠</span>
            AI-Optimized Itinerary -{" "}
            {routeConfigurations[selectedRouteType]?.name}
          </h4>
          <p className="text-purple-600 text-xs sm:text-sm">
            {routeConfigurations[selectedRouteType]?.description}
          </p>
          <p className="text-purple-500 text-xs mt-1">
            {totalSavedPlaces > 0
              ? `Basado en tus ${totalSavedPlaces} lugares guardados durante ${totalTripDays} días asignados`
              : `Itinerario tentativo para ${totalTripDays} días en tus destinos planeados`}
          </p>
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600 mb-2">
            Tipo de Ruta:
          </span>
          <Select value={selectedRouteType} onValueChange={onRouteTypeChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Ruta Actual</SelectItem>
              <SelectItem value="speed">Ruta Rápida</SelectItem>
              <SelectItem value="leisure">Ruta Relajada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline Itinerary */}
      <div className="relative">
        {optimizedItinerary.map((day, dayIndex) => (
          <div key={day.day} className="relative">
            {/* Timeline Day Header */}
            <div className={`sticky top-0 z-10 bg-gradient-to-r ${
              day.isTentative
                ? "from-blue-50 to-blue-100 border-blue-300"
                : day.isSuggested
                  ? "from-orange-50 to-orange-100 border-orange-300"
                  : "from-purple-50 to-purple-100 border-purple-300"
            } p-4 rounded-xl border-2 shadow-sm mb-6`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${
                    day.isTentative
                      ? "bg-gradient-to-br from-blue-500 to-blue-600"
                      : day.isSuggested
                        ? "bg-gradient-to-br from-orange-500 to-orange-600"
                        : "bg-gradient-to-br from-purple-500 to-purple-600"
                  } rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {day.day}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {day.date}
                      </h3>
                      {day.isTentative && (
                        <Badge className="bg-blue-500/10 text-blue-700 border-blue-300 font-medium">
                          📋 Tentativo
                        </Badge>
                      )}
                      {day.isSuggested && (
                        <Badge className="bg-orange-500/10 text-orange-700 border-orange-300 font-medium">
                          🤖 IA Sugerido
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {day.destinationName}
                        </Badge>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {day.totalTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Navigation size={14} />
                        {day.walkingTime} caminando
                      </span>
                    </div>
                  </div>
                </div>
                
                {day.places.length > 0 && (
                  <button className={`px-4 py-2 ${
                    day.isTentative
                      ? "bg-blue-500 hover:bg-blue-600"
                      : day.isSuggested
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-purple-500 hover:bg-purple-600"
                  } text-white font-medium rounded-lg flex items-center gap-2 shadow-md transition-colors`}>
                    <span className="text-lg">▶️</span>
                    Iniciar Día Completo
                  </button>
                )}
              </div>

              {day.isTentative && (
                <div className="bg-blue-100/50 p-3 rounded-lg border border-blue-200 mt-3">
                  <p className="text-sm text-blue-700 flex items-start gap-2">
                    <span className="text-lg">🗺️</span>
                    <span><strong>Plan Tentativo:</strong> Este es un plan preliminar para {day.destinationName}. Puedes guardar lugares específicos desde la sección Explorar para crear un itinerario personalizado.</span>
                  </p>
                </div>
              )}
              {day.isSuggested && (
                <div className="bg-orange-100/50 p-3 rounded-lg border border-orange-200 mt-3">
                  <p className="text-sm text-orange-700 flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span><strong>Sugerencia IA:</strong> Este día estaba disponible en tu horario. Hemos sugerido lugares populares cercanos que podrían interesarte.</span>
                  </p>
                </div>
              )}
            </div>

            {/* Timeline Content */}
            <div className="relative pl-8">
              {/* Main Timeline Line */}
              {day.places.length > 0 && (
                <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${
                  day.isTentative
                    ? "bg-blue-300"
                    : day.isSuggested
                      ? "bg-orange-300"
                      : "bg-purple-300"
                }`}></div>
              )}
              
              {day.places.map((place, index) => (
                <div key={place.id} className="relative mb-8">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-8 top-3 w-4 h-4 ${
                    place.category === "accommodation" && (place as any).auto_recommended
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                      : place.category === "accommodation"
                        ? "bg-gradient-to-br from-gray-500 to-gray-600"
                        : place.category === "transfer"
                          ? "bg-gradient-to-br from-green-500 to-emerald-500"
                          : day.isTentative
                            ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                            : day.isSuggested
                              ? "bg-gradient-to-br from-orange-500 to-yellow-500"
                              : "bg-gradient-to-br from-purple-500 to-blue-500"
                  } rounded-full border-2 border-white shadow-md flex items-center justify-center`}>
                    {place.category === "accommodation" ? (
                      (place as any).auto_recommended ? "🏠" : "🏨"
                    ) : place.category === "transfer" ? (
                      "🚗"
                    ) : (
                      <span className="text-white text-xs font-bold">{place.orderInRoute}</span>
                    )}
                  </div>

                  {/* Timeline Card */}
                  <div className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                    place.category === "accommodation" && (place as any).auto_recommended
                      ? "border-blue-200 bg-gradient-to-r from-blue-50/30 to-cyan-50/30"
                      : place.category === "transfer"
                        ? "border-green-200 bg-gradient-to-r from-green-50/30 to-emerald-50/30"
                        : day.isTentative
                          ? "border-blue-200 hover:border-blue-300"
                          : day.isSuggested
                            ? "border-orange-200 hover:border-orange-300"
                            : "border-gray-200 hover:border-purple-300"
                  }`}>
                    {/* Card Header */}
                    <div className="p-4 pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{place.image}</span>
                              <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                                {place.name}
                              </h4>
                            </div>
                            
                            {place.category === "accommodation" && (place as any).auto_recommended && (
                              <Badge className="bg-blue-500/10 text-blue-700 border-blue-300 font-medium">
                                🤖 IA Recomendado
                              </Badge>
                            )}
                            {place.category === "transfer" && (
                              <Badge className="bg-green-500/10 text-green-700 border-green-300 font-medium">
                                🚗 Traslado
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="text-xs font-medium">
                              {place.category}
                            </Badge>
                            {place.priority && (
                              <Badge className={`text-xs ${getPriorityColor(place.priority)}`}>
                                {place.priority}
                              </Badge>
                            )}
                            {place.rating && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star size={14} className="text-yellow-500 fill-current" />
                                <span className="font-medium">{place.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Time Info */}
                        <div className="flex flex-col items-end gap-1 text-right">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            place.category === "accommodation" && (place as any).auto_recommended
                              ? "bg-blue-100 text-blue-700"
                              : place.category === "transfer"
                                ? "bg-green-100 text-green-700"
                                : day.isTentative
                                  ? "bg-blue-100 text-blue-700"
                                  : day.isSuggested
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-purple-100 text-purple-700"
                          }`}>
                            ⏰ {place.bestTimeToVisit}
                          </div>
                          {place.aiRecommendedDuration && (
                            <span className="text-xs text-gray-600">
                              {place.aiRecommendedDuration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    {place.description && (
                      <div className="px-4 pb-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {place.description}
                        </p>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-white rounded border text-gray-600">
                            🚶‍♂️ {place.bestTimeToVisit}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            place.category === "accommodation" && (place as any).auto_recommended
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : place.category === "transfer"
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-purple-500 hover:bg-purple-600 text-white"
                          }`}>
                            🧭 Navegar
                          </button>
                          <button className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            🗺️ Maps
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Free Block Suggestions - Only show for days without places */}
              {day.places.length === 0 && day.freeBlocks?.some(block => block.suggestions && block.suggestions.length > 0) && (
                <div className="space-y-4 ml-2">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                    <h6 className="font-medium text-emerald-800 text-sm flex items-center">
                      <span className="mr-2">🎯</span>
                      Sugerencias Mejoradas IA V2
                    </h6>
                    <p className="text-emerald-600 text-xs mt-1">
                      Recomendaciones curadas con filtros de calidad (4.5⭐+ rating, 20+ reseñas)
                    </p>
                  </div>
                  
                  {day.freeBlocks?.map((block, blockIndex) => 
                    block.suggestions?.map((suggestion, suggestionIndex) => (
                      <div key={`${blockIndex}-${suggestionIndex}`} className="relative">
                        <div className={`flex flex-col sm:flex-row sm:items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                          suggestion.synthetic 
                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                            : 'bg-white border-emerald-200 hover:border-emerald-300'
                        }`}>
                          <div className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-1">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${
                              suggestion.synthetic 
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                                : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                            }`}>
                              {suggestion.synthetic ? '🤖' : '✅'}
                            </div>
                            <span className={`text-xs font-medium ${
                              suggestion.synthetic ? 'text-blue-600' : 'text-emerald-600'
                            }`}>
                              {suggestion.eta_minutes}min caminando
                            </span>
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-800 flex items-center space-x-2 text-sm sm:text-base">
                                  <span className="text-lg sm:text-xl">{suggestion.synthetic ? '🤖' : '✅'}</span>
                                  <span className="break-words">{suggestion.name}</span>
                                  <Badge 
                                    variant={suggestion.synthetic ? "secondary" : "default"}
                                    className="text-xs"
                                  >
                                    {suggestion.synthetic ? "IA Generado" : "Google Places"}
                                  </Badge>
                                </h5>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs capitalize bg-gray-50"
                                  >
                                    {suggestion.type.replace(/_/g, ' ')}
                                  </Badge>
                                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                    <Star size={12} className="text-yellow-500 fill-current mr-1" />
                                    {suggestion.rating}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className={`p-3 rounded-md ${
                              suggestion.synthetic ? 'bg-blue-50 border border-blue-200' : 'bg-emerald-50 border border-emerald-200'
                            }`}>
                              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                                📍 {suggestion.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Day Connector Line to Next Day */}
            {dayIndex < optimizedItinerary.length - 1 && (
              <div className="relative -ml-0 mb-8 pl-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-md -ml-8">
                    <span className="text-white text-sm">🌙</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                  <span className="text-sm text-gray-500 font-medium">Fin del día {day.day}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Day Summary and Metrics */}
      {optimizationMetrics && (
        <div className="mt-8">
          <OptimizationMetrics 
            metrics={optimizationMetrics} 
            recommendations={apiRecommendations}
          />
        </div>
      )}
    </div>
  );
};

export default ItineraryTabTimeline;