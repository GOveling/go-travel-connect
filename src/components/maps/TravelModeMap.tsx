import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, Layers, Target, Compass } from "lucide-react";
interface Position {
  lat: number;
  lng: number;
  accuracy?: number;
  coords?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface NearbyPlace {
  id: string;
  name: string;
  distance: number;
  tripId: string;
  category?: string;
  priority?: string;
  lat?: number;
  lng?: number;
  tripName?: string;
  hasNotified?: Record<number, boolean>;
  visited?: boolean;
  description?: string;
}

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface TravelModeMapProps {
  currentPosition: Position | null;
  nearbyPlaces: NearbyPlace[];
  userPath?: Array<{ lat: number; lng: number; timestamp: number }>;
  heading?: number;
  className?: string;
  showUserLocation?: boolean;
  followUser?: boolean;
}

// User location icon with direction
const createUserIcon = (heading?: number) => {
  const rotation = heading ? `transform: rotate(${heading}deg);` : '';
  return L.divIcon({
    html: `<div style="
      background-color: #3b82f6;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
      ${rotation}
    ">
      <div style="width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent; border-bottom: 8px solid white; margin-top: -2px;"></div>
    </div>`,
    className: 'travel-user-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Nearby place marker
const createPlaceIcon = (distance: number, visited: boolean = false) => {
  const color = visited ? '#10b981' : distance < 100 ? '#ef4444' : distance < 500 ? '#f59e0b' : '#6b7280';
  const icon = visited ? '✓' : distance < 100 ? '📍' : '📌';
  
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
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      animation: ${distance < 100 ? 'pulse 2s infinite' : 'none'};
    ">${icon}</div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
    </style>`,
    className: 'travel-place-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const MapController = ({ 
  currentPosition, 
  followUser, 
  bounds 
}: { 
  currentPosition: Position | null; 
  followUser: boolean;
  bounds: LatLngBounds | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (followUser && currentPosition) {
      map.setView([currentPosition.coords.latitude, currentPosition.coords.longitude], 16, {
        animate: true,
        duration: 1
      });
    } else if (bounds && !followUser) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, currentPosition, followUser, bounds]);

  return null;
};

const TravelModeMap: React.FC<TravelModeMapProps> = ({
  currentPosition,
  nearbyPlaces,
  userPath = [],
  heading,
  className = "",
  showUserLocation = true,
  followUser = true
}) => {
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'terrain'>('street');
  const [isFollowingUser, setIsFollowingUser] = useState(followUser);

  // Calculate map bounds to include user position and nearby places
  const mapBounds = useMemo(() => {
    const allPoints: Array<{ lat: number; lng: number }> = [];
    
    if (currentPosition) {
      const lat = currentPosition.coords?.latitude || currentPosition.lat;
      const lng = currentPosition.coords?.longitude || currentPosition.lng;
      allPoints.push({ lat, lng });
    }
    
    nearbyPlaces.forEach(place => {
      if (place.lat && place.lng) {
        allPoints.push({ lat: place.lat, lng: place.lng });
      }
    });
    
    if (allPoints.length === 0) return null;
    
    const bounds = new LatLngBounds([]);
    allPoints.forEach(point => {
      bounds.extend([point.lat, point.lng]);
    });
    
    return bounds;
  }, [currentPosition, nearbyPlaces]);

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

  // Prepare user path for polyline (last 50 points to avoid performance issues)
  const pathCoordinates = useMemo(() => {
    const recentPath = userPath.slice(-50);
    return recentPath.map(point => [point.lat, point.lng] as [number, number]);
  }, [userPath]);

  if (!currentPosition && nearbyPlaces.length === 0) {
    return (
      <Card className="h-64 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Esperando ubicación GPS...</p>
        </div>
      </Card>
    );
  }

  const defaultCenter: [number, number] = currentPosition 
    ? [
        currentPosition.coords?.latitude || currentPosition.lat, 
        currentPosition.coords?.longitude || currentPosition.lng
      ]
    : [40.4168, -3.7038]; // Madrid as fallback

  return (
    <div className={`relative ${className}`}>
      <Card className="overflow-hidden">
        <div className="relative h-64 sm:h-80">
          <MapContainer
            center={defaultCenter}
            zoom={15}
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer url={getTileLayerUrl()} />
            
            {/* User position marker */}
            {showUserLocation && currentPosition && (
              <>
                <Marker
                  position={[
                    currentPosition.coords?.latitude || currentPosition.lat,
                    currentPosition.coords?.longitude || currentPosition.lng
                  ]}
                  icon={createUserIcon(heading)}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">Tu ubicación</div>
                      <div className="text-muted-foreground text-xs">
                        Precisión: ±{Math.round(currentPosition.coords?.accuracy || currentPosition.accuracy || 0)}m
                      </div>
                      {heading && (
                        <div className="text-xs text-blue-600 mt-1">
                          <Compass className="h-3 w-3 inline mr-1" />
                          Rumbo: {Math.round(heading)}°
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
                
                {/* Accuracy circle */}
                <Circle
                  center={[
                    currentPosition.coords?.latitude || currentPosition.lat,
                    currentPosition.coords?.longitude || currentPosition.lng
                  ]}
                  radius={currentPosition.coords?.accuracy || currentPosition.accuracy || 50}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    weight: 1
                  }}
                />
              </>
            )}

            {/* Nearby places markers */}
            {nearbyPlaces.filter(place => place.lat && place.lng).map((place, index) => (
              <Marker
                key={`place-${place.id || index}`}
                position={[place.lat!, place.lng!]}
                icon={createPlaceIcon(place.distance, place.visited)}
              >
                <Popup>
                  <div className="text-sm max-w-48">
                    <div className="font-semibold">{place.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {Math.round(place.distance)}m de distancia
                    </div>
                    {place.description && (
                      <div className="text-xs mt-1">{place.description}</div>
                    )}
                    {place.visited && (
                      <div className="text-xs text-emerald-600 mt-1">
                        ✓ Visitado
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* User path polyline */}
            {pathCoordinates.length > 1 && (
              <Polyline
                positions={pathCoordinates}
                color="#3b82f6"
                weight={3}
                opacity={0.6}
                dashArray="5, 5"
              />
            )}

            <MapController 
              currentPosition={currentPosition}
              followUser={isFollowingUser}
              bounds={mapBounds}
            />
          </MapContainer>

          {/* Map controls */}
          <div className="absolute top-4 right-4 z-[1000] space-y-2">
            {/* Map style toggle */}
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
            
            {/* Follow user toggle */}
            {currentPosition && (
              <Button
                variant={isFollowingUser ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFollowingUser(!isFollowingUser)}
                className="bg-background/80 backdrop-blur-sm"
              >
                <Target className={`h-4 w-4 ${isFollowingUser ? 'text-white' : ''}`} />
              </Button>
            )}
          </div>

          {/* Status panel */}
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            <Card className="bg-background/90 backdrop-blur-sm p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {nearbyPlaces.length} lugar{nearbyPlaces.length !== 1 ? 'es' : ''} cercano{nearbyPlaces.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {pathCoordinates.length > 1 && (
                  <div className="text-xs text-muted-foreground">
                    Ruta: {pathCoordinates.length} puntos
                  </div>
                )}
              </div>
              {nearbyPlaces.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Más cercano: {nearbyPlaces[0]?.name} ({Math.round(nearbyPlaces[0]?.distance)}m)
                </div>
              )}
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TravelModeMap;