import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Layers } from "lucide-react";
import { ApiDayItinerary } from "@/types/aiSmartRouteApi";
import { useOSRMDirections } from "@/hooks/useOSRMDirections";
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

// Custom hotel marker icons
const createHotelIcon = (autoRecommended: boolean) => {
  const icon = autoRecommended ? '🏠' : '🏨';
  const color = autoRecommended ? '#2563eb' : '#6b7280';
  
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      color: white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${icon}</div>`,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Removed createTransferIcon - transfers are now shown as routes, not markers

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
  const { calculateItineraryRoutes, calculateTransferRoutes } = useOSRMDirections();
  const [routeSegments, setRouteSegments] = useState<any[]>([]);
  const [transferRoutes, setTransferRoutes] = useState<any[]>([]);
  const { activeRoute, currentLeg } = useActiveRoute();
  const { currentPosition } = useTravelModeContext();

  // Filter itinerary based on selected day
  const displayItinerary = useMemo(() => {
    if (selectedDay !== undefined) {
      return itinerary.filter(day => day.day === selectedDay);
    }
    return itinerary;
  }, [itinerary, selectedDay]);

  // Extract all places with coordinates and categorize them
  const allPlaces = useMemo(() => {
    const places: Array<{ 
      lat: number; 
      lng: number; 
      name: string; 
      day: number; 
      order: number; 
      type: 'place' | 'hotel' | 'transfer' | 'suggestion';
      autoRecommended?: boolean;
      transportMode?: string;
      category?: string;
      distance?: number;
      duration?: string;
      place?: any;
    }> = [];
    let globalOrder = 1;

    displayItinerary.forEach(day => {
      // Process only regular places (transfers are handled separately as routes)
      day.places.forEach(place => {
        if (place.category === 'hotel' ||
                   (day.base && place.name.toLowerCase().includes('hotel')) ||
                   (day.base && place.name.toLowerCase().includes('check-in'))) {
          // Handle hotels (including check-in activities)
          const autoRecommended = day.base?.auto_recommended || false;
          places.push({
            lat: place.lat,
            lng: place.lng,
            name: place.name,
            day: day.day,
            order: globalOrder++,
            type: 'hotel',
            autoRecommended: autoRecommended,
            category: place.category,
            place: place
          });
        } else {
          // Handle regular places/attractions (no transfers in places[] anymore)
          places.push({
            lat: place.lat,
            lng: place.lng,
            name: place.name,
            day: day.day,
            order: globalOrder++,
            type: 'place',
            category: place.category,
            place: place
          });
        }
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
              type: 'suggestion',
              place: suggestion
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

  // Calculate transfer routes from day.transfers array
  useEffect(() => {
    const transfers: any[] = [];
    displayItinerary.forEach(day => {
      if (day.transfers && day.transfers.length > 0) {
        // Map from_lng/to_lng to from_lon/to_lon for OSRM hook
        const mappedTransfers = day.transfers.map(t => ({
          ...t,
          from_lon: t.from_lng,
          to_lon: t.to_lng,
          mode: t.transport_mode
        }));
        transfers.push(...mappedTransfers);
      }
    });

    if (transfers.length > 0) {
      console.log('Processing transfers from day.transfers:', transfers);
      calculateTransferRoutes(transfers).then(transferRoutes => {
        console.log('Transfer routes calculated:', transferRoutes);
        setTransferRoutes(transferRoutes);
      }).catch(error => {
        console.error('Error calculating transfer routes:', error);
        setTransferRoutes([]);
      });
    } else {
      setTransferRoutes([]);
    }
  }, [displayItinerary, calculateTransferRoutes]);

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

  const getRouteColor = (mode: string, transferType?: string) => {
    if (transferType === 'intercity_transfer') {
      return '#dc2626'; // Red for intercity transfers
    }
    
    switch (mode) {
      case 'driving': 
      case 'drive': return '#ef4444'; // Red for driving
      case 'transit': return '#10b981'; // Green for transit
      case 'bicycling': 
      case 'cycling': return '#f59e0b'; // Orange for cycling
      case 'walk':
      case 'walking':
      default: return '#3b82f6'; // Blue for walking
    }
  };

  const getRouteStyle = (transfer?: any) => {
    // Intercity transfers (long distance) are thicker
    if (transfer?.distance_km && transfer.distance_km > 50) {
      return { weight: 6, opacity: 0.9, dashArray: undefined };
    }
    // Local transfers are thinner
    return { weight: 3, opacity: 0.7, dashArray: undefined };
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
            {allPlaces.map((place, index) => {
              let icon;
              
              // Select appropriate icon based on place type
              if (place.type === 'suggestion') {
                icon = createSuggestionIcon('#10b981');
              } else if (place.type === 'hotel') {
                icon = createHotelIcon(place.autoRecommended || false);
              } else {
                // Regular numbered icon for attractions/places
                icon = createNumberedIcon(place.order);
              }

              return (
                <Marker
                  key={`${place.day}-${index}`}
                  position={[place.lat, place.lng]}
                  icon={icon}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">{place.name}</div>
                      
                      {place.type === 'hotel' && (
                        <div className="text-muted-foreground">
                          Día {place.day} - Hotel {place.autoRecommended && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 ml-1">
                              Auto-recomendado 🏠
                            </span>
                          )}
                        </div>
                      )}
                      
                      {place.type === 'place' && (
                        <div className="text-muted-foreground">
                          Día {place.day} - Parada #{place.order}
                        </div>
                      )}
                      
                      {place.type === 'suggestion' && (
                        <>
                          <div className="text-muted-foreground">
                            Día {place.day} - AI Suggestion
                          </div>
                          <div className="text-xs text-emerald-600 mt-1">
                            💡 Recommended for your free time
                          </div>
                        </>
                      )}
                      
                      {showNavigationControls && place.type !== 'suggestion' && (
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
              );
            })}

            {/* Render route lines */}
            {routeSegments.map((segment, index) => {
              const routeStyle = getRouteStyle(segment.transferType);
              return (
                <Polyline
                  key={index}
                  positions={segment.result.coordinates.map((coord: any) => [coord.lat, coord.lng])}
                  color={getRouteColor(segment.mode, segment.transferType)}
                  weight={routeStyle.weight}
                  opacity={routeStyle.opacity}
                  dashArray={routeStyle.dashArray}
                  eventHandlers={{
                    click: () => {
                      console.log(`Route: ${segment.from} → ${segment.to}`, {
                        mode: segment.mode,
                        distance: segment.result.distance,
                        duration: segment.result.duration
                      });
                    }
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">📍 {segment.from} → {segment.to}</div>
                      <div className="text-muted-foreground mt-1">
                        🚶‍♂️ Modo: {segment.mode === 'walking' ? 'Caminando' : 
                                      segment.mode === 'driving' ? 'Conduciendo' :
                                      segment.mode === 'cycling' ? 'Ciclismo' : segment.mode}
                      </div>
                      {segment.result.distance !== 'N/A' && (
                        <div className="text-xs text-muted-foreground mt-1">
                          📏 {segment.result.distance} • 🕒 {segment.result.duration}
                        </div>
                      )}
                      {segment.transferType === 'intercity_transfer' && (
                        <div className="text-xs text-red-600 mt-1">
                          ✈️ Transfer intercity
                        </div>
                      )}
                    </div>
                  </Popup>
                </Polyline>
              );
            })}

            {/* Render transfer routes from day.transfers */}
            {transferRoutes.map((transferRoute, index) => {
              const { transfer, route } = transferRoute;
              const routeStyle = getRouteStyle(transfer);
              const isIntercity = transfer.distance_km && transfer.distance_km > 50;
              
              if (!route || !route.coordinates || route.coordinates.length === 0) {
                // Fallback to straight line for flights or failed OSRM routes
                return (
                  <Polyline
                    key={`transfer-fallback-${index}`}
                    positions={[
                      [transfer.from_lat, transfer.from_lng],
                      [transfer.to_lat, transfer.to_lng]
                    ]}
                    color={getRouteColor(transfer.transport_mode)}
                    weight={routeStyle.weight}
                    opacity={routeStyle.opacity}
                    dashArray={transfer.transport_mode === 'flight' ? '10, 10' : undefined}
                  >
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">
                          🔄 Transfer #{transfer.transfer_order}: {transfer.name}
                        </div>
                        {transfer.from_place && transfer.to_place && (
                          <div className="text-muted-foreground text-xs mt-1">
                            {transfer.from_place} → {transfer.to_place}
                          </div>
                        )}
                        <div className="text-muted-foreground mt-1">
                          📍 Distancia: {transfer.distance_km?.toFixed(1)}km
                        </div>
                        <div className="text-muted-foreground">
                          🚗 Modo: {transfer.transport_mode}
                        </div>
                        {isIntercity && (
                          <div className="text-red-600 text-xs mt-1 font-semibold">
                            ✈️ Transfer intercity
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Polyline>
                );
              }

              // Render actual OSRM route
              return (
                <Polyline
                  key={`transfer-route-${index}`}
                  positions={route.coordinates.map((coord: any) => [coord.lat, coord.lng])}
                  color={getRouteColor(transfer.transport_mode)}
                  weight={routeStyle.weight}
                  opacity={routeStyle.opacity}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">
                        🔄 Transfer #{transfer.transfer_order}: {transfer.name}
                      </div>
                      {transfer.from_place && transfer.to_place && (
                        <div className="text-muted-foreground text-xs mt-1">
                          {transfer.from_place} → {transfer.to_place}
                        </div>
                      )}
                      <div className="text-muted-foreground mt-1">
                        📍 {route.distance}
                      </div>
                      <div className="text-muted-foreground">
                        ⏱️ {route.duration}
                      </div>
                      <div className="text-muted-foreground">
                        🚗 Modo: {transfer.transport_mode}
                      </div>
                      {isIntercity && (
                        <div className="text-red-600 text-xs mt-1 font-semibold">
                          ✈️ Transfer intercity ({transfer.distance_km?.toFixed(0)}km)
                        </div>
                      )}
                    </div>
                  </Popup>
                </Polyline>
              );
            })}

            {/* Render active route if available */}
            {currentLeg && currentLeg.result.coordinates && (
              <Polyline
                positions={currentLeg.result.coordinates.map(coord => [coord.lat, coord.lng] as [number, number])}
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