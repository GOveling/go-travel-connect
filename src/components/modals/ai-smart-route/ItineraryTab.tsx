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

interface ItineraryTabProps {
  optimizedItinerary: DayItinerary[];
  selectedRouteType: string;
  routeConfigurations: { [key: string]: RouteConfiguration };
  totalSavedPlaces: number;
  totalTripDays: number;
  onRouteTypeChange: (routeType: string) => void;
  optimizationMetrics?: OptimizationMetricsType | null;
  apiRecommendations?: string[];
}

const ItineraryTab = ({
  optimizedItinerary,
  selectedRouteType,
  routeConfigurations,
  totalSavedPlaces,
  totalTripDays,
  onRouteTypeChange,
  optimizationMetrics,
  apiRecommendations = [],
}: ItineraryTabProps) => {
  return (
    <div className="space-y-4 mt-4 px-2 sm:px-0">
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
              ? `Based on your ${totalSavedPlaces} saved places over ${totalTripDays} allocated days`
              : `Tentative itinerary for ${totalTripDays} days across your planned destinations`}
          </p>
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600 mb-2">
            Route Type:
          </span>
          <Select value={selectedRouteType} onValueChange={onRouteTypeChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Route</SelectItem>
              <SelectItem value="speed">Speed Route</SelectItem>
              <SelectItem value="leisure">Leisure Route</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {optimizedItinerary.map((day) => (
        <Card
          key={day.day}
          className={`border-l-4 ${
            day.isTentative
              ? "border-l-blue-500 bg-blue-50"
              : day.isSuggested
                ? "border-l-orange-500 bg-orange-50"
                : "border-l-purple-500"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Calendar
                    className={
                      day.isTentative
                        ? "text-blue-600"
                        : day.isSuggested
                          ? "text-orange-600"
                          : "text-purple-600"
                    }
                    size={18}
                  />
                  <span className="text-base sm:text-lg">{day.date}</span>
                  {day.isTentative && (
                    <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                      Tentative Plan
                    </Badge>
                  )}
                  {day.isSuggested && (
                    <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                      AI Suggested
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {day.destinationName}
                  </Badge>
                  <Badge
                    className={`text-xs ${
                      day.isTentative
                        ? "bg-blue-100 text-blue-800"
                        : day.isSuggested
                          ? "bg-orange-100 text-orange-800"
                          : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {day.allocatedDays} day{day.allocatedDays > 1 ? "s" : ""}{" "}
                    allocated
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {day.totalTime}
                </span>
                <span className="flex items-center">
                  <Navigation size={12} className="mr-1" />
                  {day.walkingTime} walking
                </span>
              </div>
            </CardTitle>
            {day.isTentative && (
              <div className="bg-blue-100 p-2 rounded-lg border border-blue-200 mt-2">
                <p className="text-xs text-blue-700">
                  🗺️ <strong>Tentative Itinerary:</strong> This is a preliminary
                  plan for {day.destinationName}. You can save specific places
                  from the Explore section to create a personalized itinerary.
                </p>
              </div>
            )}
            {day.isSuggested && (
              <div className="bg-orange-100 p-2 rounded-lg border border-orange-200 mt-2">
                <p className="text-xs text-orange-700">
                  💡 <strong>AI Suggestion:</strong> This day was available in
                  your schedule. We've suggested popular nearby places you might
                  enjoy visiting.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {day.places.map((place, index) => (
              <div key={place.id} className="relative">
                {index < day.places.length - 1 && (
                  <div
                    className={`absolute left-6 top-16 w-0.5 h-8 ${
                      day.isTentative
                        ? "bg-blue-200"
                        : day.isSuggested
                          ? "bg-orange-200"
                          : "bg-purple-200"
                    } hidden sm:block`}
                  ></div>
                )}
                <div
                  className={`flex flex-col sm:flex-row sm:items-start gap-3 bg-white p-3 rounded-lg border ${
                    day.isTentative
                      ? "border-blue-200"
                      : day.isSuggested
                        ? "border-orange-200"
                        : ""
                  }`}
                >
                  <div className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-1">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${
                        day.isTentative
                          ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                          : day.isSuggested
                            ? "bg-gradient-to-br from-orange-500 to-yellow-500"
                            : "bg-gradient-to-br from-purple-500 to-blue-500"
                      } rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base`}
                    >
                      {place.orderInRoute}
                    </div>
                    <span className="text-xs text-gray-500">
                      {place.bestTimeToVisit}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 flex items-center space-x-2 text-sm sm:text-base">
                          <span className="text-lg sm:text-xl">
                            {place.image}
                          </span>
                          <span className="break-words">{place.name}</span>
                          {day.isTentative && (
                            <span className="text-xs text-blue-600 font-normal">
                              (Tentative)
                            </span>
                          )}
                          {day.isSuggested && (
                            <span className="text-xs text-orange-600 font-normal">
                              (Suggested)
                            </span>
                          )}
                        </h5>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {place.category}
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                        <Badge
                          className={`text-xs ${getPriorityColor(place.priority)}`}
                        >
                          {place.priority}
                        </Badge>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <Star
                            size={12}
                            className="text-yellow-500 fill-current mr-1"
                          />
                          {place.rating}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {place.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div
                        className={`${
                          day.isTentative
                            ? "bg-blue-50"
                            : day.isSuggested
                              ? "bg-orange-50"
                              : "bg-purple-50"
                        } p-2 rounded`}
                      >
                        <span
                          className={`font-medium ${
                            day.isTentative
                              ? "text-blue-800"
                              : day.isSuggested
                                ? "text-orange-800"
                                : "text-purple-800"
                          }`}
                        >
                          AI Duration:
                        </span>
                        <span
                          className={`${
                            day.isTentative
                              ? "text-blue-600"
                              : day.isSuggested
                                ? "text-orange-600"
                                : "text-purple-600"
                          } ml-1`}
                        >
                          {place.aiRecommendedDuration}
                        </span>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="font-medium text-blue-800">
                          Best Time:
                        </span>
                        <span className="text-blue-600 ml-1">
                          {place.bestTimeToVisit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Free Block Suggestions - Only show for days without places */}
            {day.places.length === 0 && day.freeBlocks?.some(block => block.suggestions && block.suggestions.length > 0) && (
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-200">
                  <h6 className="font-medium text-emerald-800 text-sm flex items-center">
                    <span className="mr-2">🎯</span>
                    AI V2 Enhanced Suggestions
                  </h6>
                  <p className="text-emerald-600 text-xs mt-1">
                    Curated recommendations with quality filters (4.5⭐+ rating, 20+ reviews)
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
                            {suggestion.eta_minutes}min walk
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
                                  {suggestion.synthetic ? "AI Generated" : "Google Places"}
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

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="bg-emerald-50 p-2 rounded">
                              <span className="font-medium text-emerald-800">
                                Walking Time:
                              </span>
                              <span className="text-emerald-600 ml-1">
                                {suggestion.eta_minutes} minutes
                              </span>
                            </div>
                            <div className="bg-teal-50 p-2 rounded">
                              <span className="font-medium text-teal-800">
                                Type:
                              </span>
                              <span className="text-teal-600 ml-1">
                                {suggestion.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="bg-gray-50 p-3 rounded-lg">
              <h6 className="font-medium text-gray-800 mb-3 text-sm">
                Day Summary
              </h6>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <span className="text-gray-600 block mb-1">
                    Total Activity Time:
                  </span>
                  <p className="font-medium">{day.totalTime}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">
                    Walking Time:
                  </span>
                  <p className="font-medium">{day.walkingTime}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">
                    Transport Time:
                  </span>
                  <p className="font-medium">{day.transportTime}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Free Time:</span>
                  <p className="font-medium">{day.freeTime}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-600 block mb-1">
                    Days Allocated:
                  </span>
                  <p className="font-medium">{day.allocatedDays}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Optimization Metrics */}
      {optimizationMetrics && (
        <OptimizationMetrics 
          metrics={optimizationMetrics} 
          recommendations={apiRecommendations}
        />
      )}
    </div>
  );
};

export default ItineraryTab;
