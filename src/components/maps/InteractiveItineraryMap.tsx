import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Layers } from "lucide-react";
import { ApiDayItinerary } from "@/types/aiSmartRouteApi";
import { useGoogleDirections } from "@/hooks/useGoogleDirections";
import { useActiveRoute } from "@/contexts/ActiveRouteContext";
import { useTravelModeContext } from "@/contexts/TravelModeContext";
import { hapticFeedbackService } from "@/services/HapticFeedbackService";

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface InteractiveItineraryMapProps {
  itinerary: ApiDayItinerary[];
  selectedDay?: number;
  transportMode?: 'walking' | 'driving' | 'transit' | 'bicycling';
  className?: string;
  showNavigationControls?: boolean;
  onStartNavigation?: (place: any) => void;
}

// Custom numbered marker icons
const createNumberedIcon = (number: number, color: string = '#3b82f6') => {
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${number}</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Custom suggestion marker icon
const createSuggestionIcon = (color: string = '#10b981') => {
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">💡</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const MapController = ({ bounds, selectedDay }: { bounds: LatLngBounds | null; selectedDay?: number }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, bounds, selectedDay]);

  return null;
};

const InteractiveItineraryMap: React.FC<InteractiveItineraryMapProps> = ({
  itinerary,
  selectedDay,
  transportMode = 'walking',
  className = "",
  showNavigationControls = false,
  onStartNavigation
}) => {
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'terrain'>('street');
  const { calculateItineraryRoutes } = useGoogleDirections();
  const [routeSegments, setRouteSegments] = useState<any[]>([]);
  const { activeRoute, currentLeg } = useActiveRoute();
  const { currentPosition } = useTravelModeContext();

  // Filter itinerary based on selected day
  const displayItinerary = useMemo(() => {
    if (selectedDay !== undefined) {
      return itinerary.filter(day => day.day === selectedDay);
    }
    return itinerary;
  }, [itinerary, selectedDay]);

  // Extract all places with coordinates and suggestions for days without places
  const allPlaces = useMemo(() => {
    const places: Array<{ lat: number; lng: number; name: string; day: number; order: number; type: 'place' | 'suggestion' }> = [];
    let globalOrder = 1;

    displayItinerary.forEach(day => {
      // Add regular places
      day.places.forEach(place => {
        places.push({
          lat: place.lat,
          lng: place.lng,
          name: place.name,
          day: day.day,
          order: globalOrder++,
          type: 'place'
        });
      });

      // Add suggestions only for days without places
      if (day.places.length === 0 && day.free_blocks) {
        day.free_blocks.forEach(block => {
          block.suggestions?.forEach(suggestion => {
            places.push({
              lat: suggestion.lat,
              lng: suggestion.lon,
              name: suggestion.name,
              day: day.day,
              order: globalOrder++,
              type: 'suggestion'
            });
          });
        });
      }
    });

    return places;
  }, [displayItinerary]);

  // Calculate map bounds
  const mapBounds = useMemo(() => {
    if (allPlaces.length === 0) return null;
    
    const bounds = new LatLngBounds([]);
    allPlaces.forEach(place => {
      bounds.extend([place.lat, place.lng]);
    });
    
    return bounds;
  }, [allPlaces]);

  // Calculate routes between places
  useEffect(() => {
    if (allPlaces.length > 1) {
      calculateItineraryRoutes(allPlaces, transportMode).then(segments => {
        setRouteSegments(segments);
      });
    }
  }, [allPlaces, transportMode, calculateItineraryRoutes]);

  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getRouteColor = (mode: string) => {
    switch (mode) {
      case 'driving': return '#ef4444';
      case 'transit': return '#10b981';
      case 'bicycling': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  if (allPlaces.length === 0) {
    return (
      <Card className="h-80 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No hay lugares para mostrar en el mapa</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Card className="overflow-hidden">
        <div className="relative h-80 sm:h-96">
          <MapContainer
            bounds={mapBounds || undefined}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer url={getTileLayerUrl()} />
            
            {/* Render markers */}
            {allPlaces.map((place, index) => (
              <Marker
                key={`${place.day}-${index}`}
                position={[place.lat, place.lng]}
                icon={place.type === 'suggestion' 
                  ? createSuggestionIcon('#10b981') 
                  : createNumberedIcon(place.order)
                }
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold">{place.name}</div>
                    <div className="text-muted-foreground">
                      Día {place.day} - {place.type === 'suggestion' ? 'AI Suggestion' : `Parada #${place.order}`}
                    </div>
                    {place.type === 'suggestion' && (
                      <div className="text-xs text-emerald-600 mt-1">
                        💡 Recommended for your free time
                      </div>
                    )}
                    {showNavigationControls && place.type === 'place' && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            await hapticFeedbackService.trigger('navigation_start');
                            onStartNavigation?.(place);
                          }}
                          className="text-xs"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Navegar aquí
                        </Button>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Render route lines */}
            {routeSegments.map((segment, index) => (
              <Polyline
                key={index}
                positions={segment.result.coordinates.map((coord: any) => [coord.lat, coord.lng])}
                color={getRouteColor(segment.mode)}
                weight={4}
                opacity={0.7}
              />
            ))}

            {/* Render active route if available */}
            {currentLeg && currentLeg.result.coordinates && (
              <Polyline
                positions={currentLeg.result.coordinates.map(coord => [coord.lat, coord.lng])}
                color="#10b981"
                weight={6}
                opacity={0.9}
                dashArray="10, 5"
              />
            )}

            {/* Show current position */}
            {currentPosition && (
              <Marker 
                position={[currentPosition.lat, currentPosition.lng]}
                icon={L.divIcon({
                  html: `<div style="
                    background-color: #3b82f6;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  ">📍</div>`,
                  className: 'current-position-icon',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}
              />
            )}

            <MapController bounds={mapBounds} selectedDay={selectedDay} />
          </MapContainer>

          {/* Map controls */}
          <div className="absolute top-4 right-4 z-[1000] space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const styles: Array<'street' | 'satellite' | 'terrain'> = ['street', 'satellite', 'terrain'];
                const currentIndex = styles.indexOf(mapStyle);
                const nextIndex = (currentIndex + 1) % styles.length;
                setMapStyle(styles[nextIndex]);
              }}
              className="bg-background/80 backdrop-blur-sm"
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>

          {/* Route summary */}
          {routeSegments.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
              <Card className="bg-background/90 backdrop-blur-sm p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {routeSegments.length} segmento{routeSegments.length > 1 ? 's' : ''} de ruta
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    Modo: {transportMode === 'walking' ? 'Caminando' : 
                           transportMode === 'driving' ? 'Conduciendo' :
                           transportMode === 'transit' ? 'Transporte público' : 'Bicicleta'}
                  </span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InteractiveItineraryMap;