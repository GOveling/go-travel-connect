import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Radio } from "lucide-react";
import L from "leaflet";

// Configure Leaflet icons
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Custom markers for different users
const createUserIcon = (color: string, avatarUrl?: string, initials?: string, locationType?: string) => {
  const isRealTime = locationType === 'real_time';
  const borderStyle = isRealTime ? 'border: 3px solid white; box-shadow: 0 0 0 2px ' + color + ', 0 1px 3px rgba(0,0,0,0.4);' : 'border: 3px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);';
  
  if (avatarUrl) {
    return L.divIcon({
      html: `<div style="width: 32px; height: 32px; border-radius: 50%; ${borderStyle} background: white; display: flex; align-items: center; justify-content: center; overflow: hidden;">
               <img src="${avatarUrl}" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover;" />
             </div>`,
      className: 'custom-user-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  } else {
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; ${borderStyle} display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">
               ${initials || '?'}
             </div>`,
      className: 'custom-user-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }
};

interface SharedLocation {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  shared_at: string;
  expires_at: string;
  location_type: 'static' | 'real_time';
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface SharedLocationsMapProps {
  locations: SharedLocation[];
  currentUserId?: string;
}

export const SharedLocationsMap = ({ locations, currentUserId }: SharedLocationsMapProps) => {
  const mapRef = useRef<L.Map | null>(null);

  // Calculate center and bounds
  const center = locations.length > 0 
    ? [
        locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length,
        locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length,
      ] as [number, number]
    : [-33.4489, -70.6693] as [number, number]; // Default to Santiago

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes <= 0) return "Expirado";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserColor = (userId: string, index: number) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    if (userId === currentUserId) return '#ef4444'; // Red for current user
    return colors[index % colors.length];
  };

  // Fit map to show all locations
  useEffect(() => {
    if (mapRef.current && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [locations]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {locations.map((location, index) => {
          const isCurrentUser = location.user_id === currentUserId;
          const userColor = getUserColor(location.user_id, index);
          const initials = getInitials(location.user_profile?.full_name || '');
          
          return (
            <div key={location.id}>
              <Marker
                position={[location.lat, location.lng]}
                icon={createUserIcon(userColor, location.user_profile?.avatar_url, initials, location.location_type)}
              >
                <Popup>
                  <div className="flex items-center gap-3 p-2 min-w-[200px]">
                    <Avatar className="w-10 h-10">
                      {location.user_profile?.avatar_url ? (
                        <AvatarImage
                          src={location.user_profile.avatar_url}
                          alt={location.user_profile.full_name}
                        />
                      ) : (
                        <AvatarFallback>
                          {location.user_profile?.full_name 
                            ? getInitials(location.user_profile.full_name)
                            : "?"
                          }
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {location.user_profile?.full_name || "Usuario"}
                          {isCurrentUser && " (Tú)"}
                        </p>
                        <Badge 
                          variant={location.location_type === 'real_time' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {location.location_type === 'real_time' ? (
                            <><Radio className="h-2 w-2 mr-1" />Tiempo real</>
                          ) : (
                            <><MapPin className="h-2 w-2 mr-1" />Actual</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Desde {new Date(location.shared_at).toLocaleTimeString()}
                      </p>
                      {location.location_type === 'real_time' && (
                        <Badge variant="outline" className="mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeRemaining(location.expires_at)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Accuracy circle */}
              <Circle
                center={[location.lat, location.lng]}
                radius={50} // 50 meters accuracy circle
                fillColor={userColor}
                fillOpacity={0.1}
                color={userColor}
                weight={2}
                opacity={0.3}
              />
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
};