import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, Edit, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SavedPlaceCardProps {
  place: {
    id: string;
    name: string;
    category?: string;
    rating?: number;
    image?: string;
    description?: string;
    estimated_time?: string;
    priority?: "high" | "medium" | "low";
    destination_name?: string;
    formatted_address?: string; // snake_case from Supabase
    formattedAddress?: string; // camelCase if mapped in frontend
  };
  canEdit?: boolean;
  onDelete?: () => void;
  priorityNumber?: number; // Visual position number (1, 2, 3...)
}

export const SavedPlaceCard = ({
  place,
  canEdit,
  onDelete,
  priorityNumber,
}: SavedPlaceCardProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Baja";
      default:
        return "Sin definir";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("saved_places")
        .delete()
        .eq("id", place.id);

      if (error) throw error;

      toast({
        title: "Lugar eliminado",
        description: `Se ha eliminado ${place.name} de tu viaje`,
      });

      onDelete();
    } catch (error: any) {
      console.error("Error deleting place:", error);
      toast({
        title: "Error al eliminar",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            {priorityNumber && (
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-full text-xs font-bold shadow-md flex-shrink-0 mt-1">
                {priorityNumber}
              </div>
            )}
            {canEdit && (
              <div
                className="flex items-center justify-center pt-1 select-none no-native-drag"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              >
                <GripVertical
                  className="h-4 w-4 text-gray-400"
                  aria-label="Reordenar"
                />
              </div>
            )}

            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-1">{place.name}</h4>
              {place.destination_name && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {place.destination_name}
                </div>
              )}
              {(place.formatted_address || place.formattedAddress) && (
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  {place.formatted_address || place.formattedAddress}
                </div>
              )}
              {place.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {place.description}
                </p>
              )}
            </div>

            {place.image && (
              <img
                src={place.image}
                alt={place.name}
                className="w-16 h-16 object-cover rounded-lg"
                draggable={false}
                loading="lazy"
                onDragStart={(e) => e.preventDefault()}
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {place.rating && place.rating > 0 && (
              <div className="flex items-center space-x-1">
                {renderStars(place.rating)}
                <span className="text-sm text-muted-foreground ml-1">
                  ({place.rating})
                </span>
              </div>
            )}

            {place.priority && (
              <Badge className={getPriorityColor(place.priority)}>
                {getPriorityText(place.priority)}
              </Badge>
            )}

            {place.category && (
              <Badge variant="outline">{place.category}</Badge>
            )}
          </div>

          {canEdit && (
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {place.estimated_time && (
          <div className="flex items-center text-sm text-muted-foreground mt-2 pt-2 border-t">
            <Clock className="h-4 w-4 mr-1" />
            Tiempo estimado: {place.estimated_time}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
