import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Navigation, ExternalLink, Play } from "lucide-react";
import { DayItinerary, RouteConfiguration } from "@/types/aiSmartRoute";
import { getPriorityColor } from "@/utils/aiSmartRoute";
import { useActiveRoute } from "@/contexts/ActiveRouteContext";
import { hapticFeedbackService } from "@/services/HapticFeedbackService";
import { toast } from "sonner";
import TransferBlock from "./TransferBlock";
import FreeTimeBlock from "./FreeTimeBlock";
import AccommodationBase from "./AccommodationBase";
import OptimizationMetrics from "./OptimizationMetrics";
import RouteSegment from "@/components/ui/RouteSegment";
import NavigationScreen from "@/components/navigation/NavigationScreen";
import type { OptimizationMetrics as OptimizationMetricsType } from "@/types/aiSmartRouteApi";

interface ItineraryTabEnhancedProps {
  optimizedItinerary: DayItinerary[];
  selectedRouteType: string;
  routeConfigurations: { [key: string]: RouteConfiguration };
  totalSavedPlaces: number;
  totalTripDays: number;
  onRouteTypeChange: (routeType: string) => void;
  optimizationMetrics?: OptimizationMetricsType | null;
  apiRecommendations?: string[];
}

const ItineraryTabEnhanced = ({
  optimizedItinerary,
  selectedRouteType,
  routeConfigurations,
  totalSavedPlaces,
  totalTripDays,
  onRouteTypeChange,
  optimizationMetrics,
  apiRecommendations = [],
}: ItineraryTabEnhancedProps) => {
  const { createRoute, startNavigation } = useActiveRoute();
  const [showNavigationScreen, setShowNavigationScreen] = useState(false);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  const handleStartDayNavigation = async (day: DayItinerary) => {
    if (day.places.length === 0) {
      toast.error('No hay lugares para navegar en este día');
      return;
    }

    setIsCreatingRoute(true);
    
    try {
      // Convert day places to navigation format
      const places = day.places.map(place => ({
        lat: place.lat,
        lng: place.lng,
        name: place.name,
        place_id: place.id
      }));

      // Create navigation route
      await createRoute(places, 'walking', `day-${day.day}`);
      
      // Start navigation
      await startNavigation();
      
      // Trigger haptic feedback
      await hapticFeedbackService.trigger('navigation_start');
      
      // Show navigation screen
      setShowNavigationScreen(true);
      
      toast.success('Navegación iniciada');
    } catch (error) {
      console.error('Error starting navigation:', error);
      toast.error('Error al iniciar la navegación');
    } finally {
      setIsCreatingRoute(false);
    }
  };

  const handleStartPlaceNavigation = async (place: any) => {
    setIsCreatingRoute(true);
    
    try {
      const places = [{
        lat: place.lat,
        lng: place.lng,
        name: place.name,
        place_id: place.id
      }];

      await createRoute(places, 'walking', `place-${place.id}`);
      await startNavigation();
      await hapticFeedbackService.trigger('navigation_start');
      
      setShowNavigationScreen(true);
      toast.success(`Navegando hacia ${place.name}`);
    } catch (error) {
      console.error('Error starting navigation:', error);
      toast.error('Error al iniciar la navegación');
    } finally {
      setIsCreatingRoute(false);
    }
  };

  const getExternalMapsUrl = (place: any) => {
    return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  };

  if (showNavigationScreen) {
    return (
      <NavigationScreen 
        onClose={() => setShowNavigationScreen(false)}
      />
    );
  }

  return (
    <div className="space-y-4 mt-4 px-2 sm:px-0">
      <div className="flex flex-col gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 sm:p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center text-sm sm:text-base">
            <span className="mr-2">🧠</span>
            AI-Optimized Itinerary -{" "}
            {routeConfigurations[selectedRouteType]?.name}
          </h4>
          <p className="text-purple-700 text-xs sm:text-sm">
            {routeConfigurations[selectedRouteType]?.description}
          </p>
        </div>

        {optimizedItinerary.map((day, index) => (
          <Card key={`day-${day.day}`} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {day.day}
                  </div>
                  Day {day.day}
                  {day.date && (
                    <span className="text-sm text-muted-foreground">
                      ({new Date(day.date).toLocaleDateString()})
                    </span>
                  )}
                </CardTitle>
                
                {day.places.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStartDayNavigation(day)}
                      disabled={isCreatingRoute}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {isCreatingRoute ? 'Preparando...' : 'Iniciar día'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Accommodation - commented out as not available in current DayItinerary type */}
              {/* {day.accommodation && (
                <AccommodationBase accommodation={day.accommodation} />
              )} */}

              {/* Places */}
              {day.places.length > 0 ? (
                <div className="space-y-3">
                  {day.places.map((place, placeIndex) => (
                    <div key={`place-${place.id}`}>
                      <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {placeIndex + 1}
                                </div>
                                <h5 className="font-semibold truncate text-sm sm:text-base">
                                  {place.name}
                                </h5>
                              </div>
                              
                              <div className="flex gap-1 flex-wrap">
                                {place.priority && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getPriorityColor(place.priority)}`}
                                  >
                                    {place.priority}
                                  </Badge>
                                )}
                                {place.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {place.category}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                              {place.time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(place.time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              )}
                              {place.rating && (
                                <div className="flex items-center gap-1">
                                  ⭐ {place.rating}
                                </div>
                              )}
                            </div>

                            {place.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                                {place.description}
                              </p>
                            )}
                          </div>

                          <div className="flex sm:flex-col gap-2">
                            <Button
                              onClick={() => handleStartPlaceNavigation(place)}
                              disabled={isCreatingRoute}
                              size="sm"
                              className="flex items-center gap-1 text-xs"
                            >
                              <Navigation className="h-3 w-3" />
                              Navegar
                            </Button>
                            
                            <Button
                              onClick={() => window.open(getExternalMapsUrl(place), '_blank')}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-xs"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Maps
                            </Button>
                          </div>
                        </div>
                      </Card>

                      {/* Route Segment - commented out due to type mismatch */}
                      {/* {placeIndex < day.places.length - 1 && (
                        <div className="my-2">
                          <RouteSegment
                            origin={place}
                            destination={day.places[placeIndex + 1]}
                            mode="walking"
                            showDuration={true}
                          />
                        </div>
                      )} */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No places scheduled for this day</p>
                </div>
              )}

              {/* Free Time Blocks */}
              {day.freeBlocks && day.freeBlocks.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <h6 className="font-medium text-sm text-muted-foreground">Free Time</h6>
                  {day.freeBlocks.map((block, blockIndex) => (
                    <FreeTimeBlock key={blockIndex} freeBlock={block} />
                  ))}
                </div>
              )}

              {/* Transfer Blocks - commented out as not available in current DayItinerary type */}
              {/* {day.transfer_blocks && day.transfer_blocks.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <h6 className="font-medium text-sm text-muted-foreground">Transfers</h6>
                  {day.transfer_blocks.map((transfer, transferIndex) => (
                    <TransferBlock key={transferIndex} transfer={transfer} />
                  ))}
                </div>
              )} */}
            </CardContent>
          </Card>
        ))}
      </div>

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

export default ItineraryTabEnhanced;