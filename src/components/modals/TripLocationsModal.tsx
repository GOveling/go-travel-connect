import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, Users, X, Radio } from "lucide-react";
import { SharedLocationsMap } from "@/components/maps/SharedLocationsMap";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TripLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  collaborators: any[];
}

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

export const TripLocationsModal = ({
  isOpen,
  onClose,
  tripId,
  collaborators,
}: TripLocationsModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getCurrentLocation, isLocating } = useUserLocation();
  const [sharedLocations, setSharedLocations] = useState<SharedLocation[]>([]);
  const [mySharedLocation, setMySharedLocation] = useState<SharedLocation | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<10 | 30 | 60>(10);

  // Fetch shared locations
  const fetchSharedLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("trip_shared_locations")
        .select(`
          id,
          user_id,
          lat,
          lng,
          shared_at,
          expires_at,
          location_type
        `)
        .eq("trip_id", tripId)
        .or('location_type.eq.static,and(location_type.eq.real_time,expires_at.gt.' + new Date().toISOString() + ')');

      if (error) throw error;

      // Add user profiles to locations
      const locationsWithProfiles = await Promise.all(
        (data || []).map(async (location) => {
          // First try to find in collaborators
          let userProfile = collaborators.find((c) => c.id === location.user_id);
          
          // If not found in collaborators, fetch from profiles table
          if (!userProfile) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", location.user_id)
              .single();
            
            userProfile = profileData;
          }
          
          return {
            ...location,
            location_type: location.location_type as 'static' | 'real_time',
            user_profile: userProfile ? {
              full_name: userProfile.full_name,
              avatar_url: userProfile.avatar_url,
            } : null,
          };
        })
      );

      setSharedLocations(locationsWithProfiles);
      
      // Find my current shared locations
      const myLocations = locationsWithProfiles.filter((loc) => loc.user_id === user?.id);
      setMySharedLocation(myLocations[0] || null);
    } catch (error) {
      console.error("Error fetching shared locations:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSharedLocations();
      // Refresh every 30 seconds
      const interval = setInterval(fetchSharedLocations, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, tripId]);

  const shareCurrentLocation = async () => {
    if (!user) return;

    try {
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        toast({
          title: "Error",
          description: "No se pudo obtener tu ubicación",
          variant: "destructive",
        });
        return;
      }

      // Delete existing static location if any
      const existingStatic = sharedLocations.find(loc => 
        loc.user_id === user.id && loc.location_type === 'static'
      );
      if (existingStatic) {
        await supabase
          .from("trip_shared_locations")
          .delete()
          .eq("id", existingStatic.id);
      }

      // Set expiration to far future for static location (1 year)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // Insert new static location
      const { error } = await supabase
        .from("trip_shared_locations")
        .insert({
          trip_id: tripId,
          user_id: user.id,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          expires_at: expiresAt.toISOString(),
          location_type: 'static',
        });

      if (error) throw error;

      toast({
        title: "Ubicación actual compartida",
        description: "Tu ubicación actual está visible para el grupo",
      });

      fetchSharedLocations();
    } catch (error) {
      console.error("Error sharing current location:", error);
      toast({
        title: "Error",
        description: "No se pudo compartir tu ubicación actual",
        variant: "destructive",
      });
    }
  };

  const shareRealTimeLocation = async (durationMinutes: number) => {
    if (!user) return;

    try {
      const currentLocation = await getCurrentLocation();
      if (!currentLocation) {
        toast({
          title: "Error",
          description: "No se pudo obtener tu ubicación",
          variant: "destructive",
        });
        return;
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

      // Delete existing real-time location if any
      const existingRealTime = sharedLocations.find(loc => 
        loc.user_id === user.id && loc.location_type === 'real_time'
      );
      if (existingRealTime) {
        await supabase
          .from("trip_shared_locations")
          .delete()
          .eq("id", existingRealTime.id);
      }

      // Insert new real-time location
      const { error } = await supabase
        .from("trip_shared_locations")
        .insert({
          trip_id: tripId,
          user_id: user.id,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          expires_at: expiresAt.toISOString(),
          location_type: 'real_time',
        });

      if (error) throw error;

      toast({
        title: "Ubicación en tiempo real",
        description: `Compartiendo ubicación en tiempo real por ${durationMinutes} minutos`,
      });

      fetchSharedLocations();
    } catch (error) {
      console.error("Error sharing real-time location:", error);
      toast({
        title: "Error",
        description: "No se pudo compartir tu ubicación en tiempo real",
        variant: "destructive",
      });
    }
  };

  const removeStaticLocation = async () => {
    if (!user) return;

    try {
      const staticLocation = sharedLocations.find(loc => 
        loc.user_id === user.id && loc.location_type === 'static'
      );
      
      if (!staticLocation) return;

      const { error } = await supabase
        .from("trip_shared_locations")
        .delete()
        .eq("id", staticLocation.id);

      if (error) throw error;

      toast({
        title: "Ubicación actual eliminada",
        description: "Tu ubicación actual ya no es visible",
      });

      fetchSharedLocations();
    } catch (error) {
      console.error("Error removing static location:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar tu ubicación actual",
        variant: "destructive",
      });
    }
  };

  const stopRealTimeSharing = async () => {
    if (!user) return;

    try {
      const realTimeLocation = sharedLocations.find(loc => 
        loc.user_id === user.id && loc.location_type === 'real_time'
      );
      
      if (!realTimeLocation) return;

      const { error } = await supabase
        .from("trip_shared_locations")
        .delete()
        .eq("id", realTimeLocation.id);

      if (error) throw error;

      toast({
        title: "Tiempo real desactivado",
        description: "Has dejado de compartir tu ubicación en tiempo real",
      });

      fetchSharedLocations();
    } catch (error) {
      console.error("Error stopping real-time sharing:", error);
      toast({
        title: "Error",
        description: "No se pudo desactivar el tiempo real",
        variant: "destructive",
      });
    }
  };

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


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicaciones del grupo
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          {/* Map Section */}
          <div className="lg:col-span-2 rounded-lg overflow-hidden">
            <SharedLocationsMap 
              locations={sharedLocations} 
              currentUserId={user?.id}
            />
          </div>

          {/* Controls Section */}
          <div className="space-y-4 overflow-y-auto">
            {/* Share Location Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Compartir mi ubicación
              </h3>

              {/* Current Location Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Ubicación actual
                </h4>
                {sharedLocations.find(loc => loc.user_id === user?.id && loc.location_type === 'static') ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium">Ubicación visible</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={removeStaticLocation}
                      className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={shareCurrentLocation}
                    disabled={isLocating}
                    variant="outline"
                    className="w-full"
                  >
                    <MapPin size={16} className="mr-2" />
                    {isLocating ? "Obteniendo ubicación..." : "Compartir ubicación actual"}
                  </Button>
                )}
              </div>

              {/* Real-time Location Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Radio className="h-3 w-3" />
                  Tiempo real
                </h4>
                {sharedLocations.find(loc => loc.user_id === user?.id && loc.location_type === 'real_time') ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Tiempo real activo</span>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeRemaining(sharedLocations.find(loc => loc.user_id === user?.id && loc.location_type === 'real_time')?.expires_at || '')}
                      </Badge>
                    </div>
                    <Button
                      onClick={stopRealTimeSharing}
                      variant="outline"
                      className="w-full"
                    >
                      Detener tiempo real
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Duración:</label>
                      <div className="flex gap-2">
                        {[10, 30, 60].map((duration) => (
                          <Button
                            key={duration}
                            size="sm"
                            variant={selectedDuration === duration ? "default" : "outline"}
                            onClick={() => setSelectedDuration(duration as 10 | 30 | 60)}
                          >
                            {duration}m
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => shareRealTimeLocation(selectedDuration)}
                      disabled={isLocating}
                      className="w-full"
                    >
                      <Radio size={16} className="mr-2" />
                      {isLocating ? "Obteniendo ubicación..." : "Activar tiempo real"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Active Locations */}
            <div className="space-y-3">
              <h3 className="font-semibold">
                Ubicaciones activas ({sharedLocations.length})
              </h3>

              <div className="space-y-2">
                {sharedLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        {location.user_profile?.avatar_url ? (
                          <AvatarImage
                            src={location.user_profile.avatar_url}
                            alt={location.user_profile.full_name}
                          />
                        ) : (
                          <AvatarFallback className="text-xs">
                            {location.user_profile?.full_name 
                              ? getInitials(location.user_profile.full_name)
                              : "?"
                            }
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {location.user_profile?.full_name || "Usuario"}
                            {location.user_id === user?.id && " (Tú)"}
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
                        <p className="text-xs text-muted-foreground">
                          Desde {new Date(location.shared_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {location.location_type === 'real_time' && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-2 w-2 mr-1" />
                          {getTimeRemaining(location.expires_at)}
                        </Badge>
                      )}
                      {location.user_id === user?.id && location.location_type === 'static' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={removeStaticLocation}
                          className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {sharedLocations.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay ubicaciones compartidas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};