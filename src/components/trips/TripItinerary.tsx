import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TripItineraryProps {
  tripId: string;
  userRole: string;
}

export const TripItinerary = ({ tripId, userRole }: TripItineraryProps) => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  const canEdit = userRole === "owner" || userRole === "editor";

  useEffect(() => {
    fetchItineraries();
  }, [tripId]);

  const fetchItineraries = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_itineraries")
        .select("*")
        .eq("trip_id", tripId)
        .order("generated_at", { ascending: false });

      if (error) throw error;
      setItineraries(data || []);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Itinerario del viaje</h3>
        {canEdit && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generar itinerario
          </Button>
        )}
      </div>

      {itineraries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay itinerarios</h3>
            <p className="text-muted-foreground mb-4">
              Aún no has creado ningún itinerario para este viaje.
            </p>
            {canEdit && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer itinerario
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {itineraries.map((itinerary: any) => (
            <Card key={itinerary.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {itinerary.route_type || "Itinerario personalizado"}
                  </span>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(itinerary.generated_at).toLocaleDateString()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Itinerario generado automáticamente basado en tus lugares
                  guardados.
                </p>
                {canEdit && (
                  <div className="mt-4 space-x-2">
                    <Button size="sm">Ver detalles</Button>
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
