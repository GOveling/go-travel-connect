import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { MapPin, Users, Calendar, X, Home } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { TripSavedPlaces } from "../trips/TripSavedPlaces";

interface TripDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string | null;
  initialTab?: string;
}

export const TripDetailsModal = ({ 
  isOpen, 
  onClose, 
  tripId, 
  initialTab = "places" 
}: TripDetailsModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>("viewer");
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Load trip details when modal opens
  useEffect(() => {
    if (isOpen && tripId && user) {
      fetchTripDetails();
    }
  }, [isOpen, tripId, user]);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const fetchTripDetails = async () => {
    if (!tripId || !user) return;

    try {
      setLoading(true);

      // Get trip data
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .single();

      if (tripError) throw tripError;

      // Determine user role
      let role = "viewer";
      if (tripData.user_id === user.id) {
        role = "owner";
      } else {
        // Check if user is a collaborator
        const { data: canEdit } = await supabase.rpc("can_edit_trip", {
          p_trip_id: tripId,
          p_user_id: user.id,
        });

        if (canEdit) {
          const { data: memberData } = await supabase
            .from("trip_collaborators")
            .select("role")
            .eq("trip_id", tripId)
            .eq("user_id", user.id)
            .single();

          if (memberData) {
            role = memberData.role;
          }
        } else {
          // Check if has access as viewer
          const { data: isCollaborator } = await supabase.rpc(
            "is_trip_collaborator",
            {
              trip_id: tripId,
              user_id: user.id,
            }
          );

          if (isCollaborator) {
            const { data: memberData } = await supabase
              .from("trip_collaborators")
              .select("role")
              .eq("trip_id", tripId)
              .eq("user_id", user.id)
              .single();

            if (memberData) {
              role = memberData.role;
            }
          } else {
            toast({
              title: "Acceso denegado",
              description: "No tienes acceso a este viaje",
              variant: "destructive",
            });
            onClose();
            return;
          }
        }
      }

      setUserRole(role);
      setTrip(tripData);
      fetchSavedPlaces();

    } catch (error) {
      console.error("Error loading trip details:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del viaje",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPlaces = async () => {
    if (!tripId) return;

    try {
      const { data, error } = await supabase
        .from("saved_places")
        .select("*")
        .eq("trip_id", tripId)
        .order("position_order", { ascending: true });

      if (error) throw error;
      setSavedPlaces(data || []);
    } catch (error) {
      console.error("Error fetching saved places:", error);
    }
  };

  const formatDateRange = () => {
    if (!trip?.start_date) return "Sin fechas definidas";

    const start = new Date(trip.start_date);
    if (!trip.end_date) return format(start, "PPP");

    const end = new Date(trip.end_date);
    return `${format(start, "PPP")} - ${format(end, "PPP")}`;
  };

  const handleClose = () => {
    setTrip(null);
    setSavedPlaces([]);
    setActiveTab(initialTab);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border-0 shadow-2xl bg-background">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1">
            <DialogTitle className="text-2xl font-bold">
              {trip?.name || "Detalles del Viaje"}
            </DialogTitle>
            {trip && (
              <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateRange()}</span>
                </div>
                {trip.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{trip.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {trip.is_group_trip ? "Viaje grupal" : "Viaje individual"}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Volver al inicio
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={48} />
          </div>
        ) : trip ? (
          <div className="overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="places">Lugares guardados</TabsTrigger>
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="collaborators">Colaboradores</TabsTrigger>
              </TabsList>

              <div className="overflow-y-auto max-h-[60vh]">
                <TabsContent value="places" className="mt-0">
                  <TripSavedPlaces
                    places={savedPlaces}
                    tripId={tripId!}
                    userRole={userRole}
                    onUpdate={fetchSavedPlaces}
                  />
                </TabsContent>

                <TabsContent value="overview" className="mt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Información del viaje</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Estado:</span>
                            <span className="ml-2 capitalize">{trip.status}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Viajeros:</span>
                            <span className="ml-2">{trip.travelers}</span>
                          </div>
                          {trip.budget && (
                            <div>
                              <span className="text-muted-foreground">Presupuesto:</span>
                              <span className="ml-2">{trip.budget}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {trip.description && (
                        <div>
                          <h3 className="font-semibold mb-2">Descripción</h3>
                          <p className="text-sm text-muted-foreground">{trip.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="collaborators" className="mt-0">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Información de colaboradores disponible en la página completa del viaje
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se pudo cargar la información del viaje</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};