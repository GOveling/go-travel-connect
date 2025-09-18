import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Layers } from "lucide-react";
import { ApiDayItinerary } from "@/types/aiSmartRouteApi";
import { useGoogleDirections, RouteSegment } from "@/hooks/useGoogleDirections";
import { useUserLocation } from "@/hooks/useUserLocation";
import { NavigationModal } from "@/components/navigation/NavigationModal";

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
  className = ""
}) => {
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'terrain'>('street');
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  
  const { calculateItineraryRoutes } = useGoogleDirections();
  const { location: userLocation, getCurrentLocation, startWatching, stopWatching } = useUserLocation();

  // Filter itinerary based on selected day
  const displayItinerary = useMemo(() => {
    if (selectedDay !== undefined) {
      return itinerary.filter(day => day.day === selectedDay);
    }
    return itinerary;
  }, [itinerary, selectedDay]);

  // Extract all places from itinerary with their types and order
  const allPlaces = useMemo(() => {
    const places: Array<{
      lat: number;
      lng: number;
      name: string;
      type: 'savedPlace' | 'suggestion';
      order: number;
      dayOrder: number;
    }> = [];

    displayItinerary.forEach((dayItinerary) => {
      // Add saved places
      dayItinerary.places.forEach((place, index) => {
        places.push({
          lat: place.lat,
          lng: place.lng,
          name: place.name,
          type: 'savedPlace',
          order: index + 1,
          dayOrder: dayItinerary.day
        });
      });

      // Add AI suggestions from free blocks
      if (dayItinerary.free_blocks) {
        dayItinerary.free_blocks.forEach((freeBlock) => {
          freeBlock.suggestions.forEach((suggestion, index) => {
            places.push({
              lat: suggestion.lat,
              lng: suggestion.lon,
              name: suggestion.name,
              type: 'suggestion',
              order: index + 1,
              dayOrder: dayItinerary.day
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

    const lats = allPlaces.map(place => place.lat);
    const lngs = allPlaces.map(place => place.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return new LatLngBounds([minLat, minLng], [maxLat, maxLng]);
  }, [allPlaces]);

  // Calculate routes when places or transport mode changes
  useEffect(() => {
    if (allPlaces.length > 1) {
      const placesForRouting = allPlaces
        .filter(place => place.type === 'savedPlace')
        .sort((a, b) => a.dayOrder - b.dayOrder || a.order - b.order);

      if (placesForRouting.length > 1) {
        calculateItineraryRoutes(placesForRouting, transportMode)
          .then(segments => {
            setRouteSegments(segments);
          })
          .catch(error => {
            console.error('Error calculating routes:', error);
            setRouteSegments([]);
          });
      }
    } else {
      setRouteSegments([]);
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
      case 'driving': return '#ef4444'; // red
      case 'transit': return '#22c55e'; // green
      case 'bicycling': return '#eab308'; // yellow
      default: return '#3b82f6'; // blue
    }
  };

  const handleStartNavigation = () => {
    if (routeSegments.length > 0) {
      // Start location tracking for navigation
      startWatching();
      setIsNavigationOpen(true);
    }
  };

  const handleStopNavigation = () => {
    setIsNavigationOpen(false);
    stopWatching();
  };

  if (allPlaces.length === 0) {
    return (
      <div className={`h-full ${className}`}>
        <Card className="h-full flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay lugares para mostrar en el mapa</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      <Card className="h-full overflow-hidden">
        <div className="relative h-full">
          <MapContainer
            bounds={mapBounds || undefined}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              url={getTileLayerUrl()}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Place markers */}
            {allPlaces.map((place, index) => (
              <Marker
                key={`${place.name}-${index}`}
                position={[place.lat, place.lng]}
                icon={place.type === 'savedPlace' 
                  ? createNumberedIcon(place.order, '#3b82f6')
                  : createSuggestionIcon('#10b981')
                }
              >
                <Popup>
                  <div className="text-center">
                    <div className="font-medium">{place.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {place.type === 'savedPlace' ? 'Lugar guardado' : 'Sugerencia IA'}
                      {selectedDay === undefined && ` • Día ${place.dayOrder}`}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route polylines */}
            {routeSegments.map((segment, index) => (
              <Polyline
                key={`route-${index}`}
                positions={segment.result.coordinates.map(coord => [coord.lat, coord.lng])}
                color={getRouteColor(segment.mode)}
                weight={4}
                opacity={0.7}
              />
            ))}

            <MapController bounds={mapBounds} selectedDay={selectedDay} />
            
            {/* User location marker */}
            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={L.divIcon({
                  html: `<div style="
                    width: 16px; 
                    height: 16px; 
                    background: #2563eb; 
                    border: 3px solid white; 
                    border-radius: 50%; 
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  "></div>`,
                  className: 'user-location-marker',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8],
                })}
              >
                <Popup>
                  <div className="text-center">
                    <div className="font-medium">Tu ubicación actual</div>
                    <div className="text-xs text-muted-foreground">
                      Precisión: {userLocation.accuracy ? `${Math.round(userLocation.accuracy)}m` : 'N/A'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
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
                <div className="flex items-center justify-between">
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
                  <Button
                    size="sm"
                    onClick={handleStartNavigation}
                    className="h-8 px-3 text-xs"
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Iniciar Navegación
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Navigation Modal */}
          <NavigationModal
            isOpen={isNavigationOpen}
            onClose={handleStopNavigation}
            routeSegments={routeSegments}
            userLocation={userLocation}
            transportMode={transportMode}
          />
        </div>
      </Card>
    </div>
  );
};

export default InteractiveItineraryMap;