import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, Users } from "lucide-react";
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
          expires_at
        `)
        .eq("trip_id", tripId)
        .gt("expires_at", new Date().toISOString());

      if (error) throw error;

      // Add user profiles to locations
      const locationsWithProfiles = await Promise.all(
        (data || []).map(async (location) => {
          const collaborator = collaborators.find((c) => c.id === location.user_id);
          return {
            ...location,
            user_profile: collaborator ? {
              full_name: collaborator.full_name,
              avatar_url: collaborator.avatar_url,
            } : null,
          };
        })
      );

      setSharedLocations(locationsWithProfiles);
      
      // Find my current shared location
      const myLocation = locationsWithProfiles.find((loc) => loc.user_id === user?.id);
      setMySharedLocation(myLocation || null);
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

  const shareLocation = async (durationMinutes: number) => {
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

      // Delete existing location if any
      if (mySharedLocation) {
        await supabase
          .from("trip_shared_locations")
          .delete()
          .eq("id", mySharedLocation.id);
      }

      // Insert new location
      const { error } = await supabase
        .from("trip_shared_locations")
        .insert({
          trip_id: tripId,
          user_id: user.id,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Ubicación compartida",
        description: `Tu ubicación se compartirá por ${durationMinutes} minutos`,
      });

      fetchSharedLocations();
    } catch (error) {
      console.error("Error sharing location:", error);
      toast({
        title: "Error",
        description: "No se pudo compartir tu ubicación",
        variant: "destructive",
      });
    }
  };

  const stopSharing = async () => {
    if (!mySharedLocation) return;

    try {
      const { error } = await supabase
        .from("trip_shared_locations")
        .delete()
        .eq("id", mySharedLocation.id);

      if (error) throw error;

      toast({
        title: "Ubicación ocultada",
        description: "Has dejado de compartir tu ubicación",
      });

      fetchSharedLocations();
    } catch (error) {
      console.error("Error stopping location sharing:", error);
      toast({
        title: "Error",
        description: "No se pudo ocultar tu ubicación",
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
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Compartir mi ubicación
              </h3>

              {!mySharedLocation ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duración:</label>
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
                    onClick={() => shareLocation(selectedDuration)}
                    disabled={isLocating}
                    className="w-full"
                  >
                    {isLocating ? "Obteniendo ubicación..." : "Compartir ubicación"}
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Compartiendo</span>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeRemaining(mySharedLocation.expires_at)}
                    </Badge>
                  </div>
                  <Button
                    onClick={stopSharing}
                    variant="outline"
                    className="w-full"
                  >
                    Dejar de compartir
                  </Button>
                </div>
              )}
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
                        <p className="text-sm font-medium">
                          {location.user_profile?.full_name || "Usuario"}
                          {location.user_id === user?.id && " (Tú)"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Desde {new Date(location.shared_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {getTimeRemaining(location.expires_at)}
                    </Badge>
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