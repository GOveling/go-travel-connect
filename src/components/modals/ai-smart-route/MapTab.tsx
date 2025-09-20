import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trip } from "@/types/aiSmartRoute";
import { ApiDayItinerary } from "@/types/aiSmartRouteApi";
import { calculateDestinationDays } from "@/utils/aiSmartRoute";
import InteractiveItineraryMap from "@/components/maps/InteractiveItineraryMap";
import DetailedNavigationPanel from "./DetailedNavigationPanel";
import { MapPin, Navigation, Calendar, Clock, Route, ArrowRight } from "lucide-react";

interface MapTabProps {
  optimizedItinerary?: ApiDayItinerary[] | any[];
  selectedRouteType?: string;
  onNavigateToPlace?: (place: any) => void;
}

const MapTab = ({ optimizedItinerary, selectedRouteType, onNavigateToPlace }: MapTabProps) => {
  const [selectedDay, setSelectedDay] = React.useState<number | undefined>(undefined);
  const [transportMode, setTransportMode] = React.useState<'walk' | 'drive' | 'transit' | 'bike'>('walk');
  const [activeMapTab, setActiveMapTab] = React.useState<'overview' | 'navigation' | 'details'>('overview');

  // Convert legacy DayItinerary to ApiDayItinerary format if needed
  const apiItinerary: ApiDayItinerary[] = React.useMemo(() => {
    if (!optimizedItinerary || optimizedItinerary.length === 0) return [];
    
    return optimizedItinerary.map((day: any, index: number) => {
      // Check if it's already in ApiDayItinerary format
      if (day.places && Array.isArray(day.places) && day.places.length > 0 && day.places[0].lat !== undefined) {
        return day as ApiDayItinerary;
      }
      
      // Convert from legacy DayItinerary format
      const places = day.places?.map((place: any, placeIndex: number) => ({
        id: place.id || `place-${index}-${placeIndex}`,
        name: place.name,
        category: place.category || 'attraction',
        rating: place.rating || 4.0,
        image: place.image || '📍',
        description: place.description || '',
        estimated_time: place.aiRecommendedDuration || '1h',
        priority: place.priority || 3,
        lat: place.coordinates?.lat || 0,
        lng: place.coordinates?.lng || 0,
        recommended_duration: place.aiRecommendedDuration || '1h',
        best_time: place.bestTimeToVisit || 'Morning',
        order: place.orderInRoute || placeIndex + 1,
        is_intercity: false
      })) || [];

      return {
        day: day.day || index + 1,
        date: day.date || new Date().toISOString().split('T')[0],
        places,
        transfers: [],
        base: {
          name: day.accommodation?.name || 'Hotel Central',
          lat: places[0]?.lat || 0,
          lon: places[0]?.lng || 0,
          address: '',
          rating: 4.0,
          type: 'hotel_from_cluster' as const,
          reference_place: null
        },
        free_blocks: day.freeBlocks || day.free_blocks || [],
        total_time: day.totalTime || '8h',
        walking_time: day.walkingTime || '2h',
        transport_time: '1h',
        free_time: '1h',
        is_suggested: day.isSuggested || false,
        is_tentative: day.isTentative || false
      } as ApiDayItinerary;
    });
  }, [optimizedItinerary]);

  // Convert ApiDayItinerary to places array for DetailedNavigationPanel
  const allPlaces = React.useMemo(() => {
    if (!apiItinerary || apiItinerary.length === 0) return [];
    
    const places: any[] = [];
    apiItinerary.forEach((day, dayIndex) => {
      day.places.forEach((place, placeIndex) => {
        places.push({
          id: place.id || `place-${dayIndex}-${placeIndex}`,
          name: place.name,
          coordinates: { lat: place.lat, lng: place.lng },
          category: place.category,
          description: place.description,
          priority: place.priority || 3,
          day: day.day,
          order: place.order || placeIndex + 1
        });
      });
    });
    return places;
  }, [apiItinerary]);

  // If no optimized itinerary, show placeholder
  if (!apiItinerary || apiItinerary.length === 0) {
    return (
      <div className="space-y-6 mt-6">
        <Card className="h-80 sm:h-96 bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-dashed border-purple-300">
          <CardContent className="h-full flex items-center justify-center">
            <div className="text-center px-4">
              <MapPin size={48} className="mx-auto text-purple-600 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                Mapa de Ruta Interactivo
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                Genere primero un itinerario para ver el mapa interactivo
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Mostrará rutas optimizadas con navegación paso a paso
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Enhanced Map with Tabs */}
      <Tabs value={activeMapTab} onValueChange={(value) => setActiveMapTab(value as 'overview' | 'navigation' | 'details')}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Mapa de Ruta Interactivo
            </h3>
            <p className="text-sm text-muted-foreground">
              Visualiza tu itinerario con navegación paso a paso y rutas detalladas
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Vista General
              </TabsTrigger>
              <TabsTrigger value="navigation" className="text-xs">
                <Route className="h-3 w-3 mr-1" />
                Navegación
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs">
                <ArrowRight className="h-3 w-3 mr-1" />
                Paso a Paso
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Transport mode selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium mr-2">Modo de transporte:</span>
                {[
                  { mode: 'walk' as const, label: 'Caminar', icon: '🚶' },
                  { mode: 'drive' as const, label: 'Conducir', icon: '🚗' },
                  { mode: 'transit' as const, label: 'Transporte', icon: '🚌' },
                  { mode: 'bike' as const, label: 'Bicicleta', icon: '🚴' }
                ].map(({ mode, label, icon }) => (
                  <Button
                    key={mode}
                    variant={transportMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTransportMode(mode)}
                    className="text-xs"
                  >
                    <span className="mr-1">{icon}</span>
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interactive Map */}
          <InteractiveItineraryMap
            itinerary={apiItinerary}
            selectedDay={selectedDay}
            transportMode={transportMode === 'walk' ? 'walking' : 
                         transportMode === 'drive' ? 'driving' :
                         transportMode === 'bike' ? 'bicycling' : 'transit'}
            className="w-full"
            showNavigationControls={true}
            onStartNavigation={onNavigateToPlace}
          />

          {/* Day selector */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Filtrar por día:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedDay === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDay(undefined)}
                  >
                    Todos los días
                  </Button>
                  {apiItinerary.map(day => (
                    <Button
                      key={day.day}
                      variant={selectedDay === day.day ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDay(day.day)}
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-3 w-3" />
                      Día {day.day}
                      <Badge variant="secondary" className="ml-1">
                        {day.places.length}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Route className="h-5 w-5 text-primary" />
                Navegación Simplificada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiItinerary.map((day) => (
                  <div key={day.day} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                        {day.day}
                      </div>
                      <h4 className="font-semibold">Día {day.day} - {day.date}</h4>
                      <Badge variant="outline">{day.places.length} lugares</Badge>
                    </div>
                    
                    <div className="space-y-2 ml-8">
                      {day.places.map((place, index) => (
                        <div key={place.id} className="flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <span className="font-medium">{place.name}</span>
                          {index < day.places.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Navegación Paso a Paso
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Direcciones detalladas entre cada lugar con información de transporte
              </p>
            </CardHeader>
            <CardContent>
              <DetailedNavigationPanel
                places={allPlaces}
                transportMode={transportMode}
                onNavigateToPlace={onNavigateToPlace}
                onStartFullRoute={() => {
                  if (allPlaces.length > 0) {
                    onNavigateToPlace?.(allPlaces);
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Estadísticas de Ruta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Total de lugares:</span>
              <span className="font-medium text-sm">
                {apiItinerary.reduce((sum, day) => sum + day.places.length, 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Días del itinerario:</span>
              <span className="font-medium text-sm">{apiItinerary.length}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Modo de transporte:</span>
              <Badge variant="secondary" className="text-xs">
                {transportMode === 'walk' ? 'Caminando' : 
                 transportMode === 'drive' ? 'Conduciendo' :
                 transportMode === 'transit' ? 'Transporte público' : 'Bicicleta'}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-muted-foreground">Tiempo total estimado:</span>
              <span className="font-medium text-sm">
                {apiItinerary.reduce((sum, day) => {
                  const hours = parseInt(day.total_time) || 8;
                  return sum + hours;
                }, 0)}h
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Resumen por Día
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {apiItinerary.slice(0, 5).map((day) => (
              <div
                key={day.day}
                className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {day.day}
                  </div>
                  <span className="text-sm font-medium">
                    {day.date}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {day.places.length} lugares
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {day.total_time}
                  </span>
                </div>
              </div>
            ))}
            {apiItinerary.length > 5 && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                ... y {apiItinerary.length - 5} días más
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapTab;
