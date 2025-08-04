import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Star, Clock, Trash2, Edit } from 'lucide-react';

interface TripSavedPlacesProps {
  places: any[];
  tripId: string;
  userRole: string;
  onUpdate: () => void;
}

export const TripSavedPlaces = ({ 
  places, 
  tripId, 
  userRole, 
  onUpdate 
}: TripSavedPlacesProps) => {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const canEdit = userRole === 'owner' || userRole === 'editor';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin definir';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lugares guardados</h3>
        {canEdit && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar lugar
          </Button>
        )}
      </div>

      {places.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay lugares guardados</h3>
            <p className="text-muted-foreground mb-4">
              Aún no has guardado ningún lugar para este viaje.
            </p>
            {canEdit && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar primer lugar
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {places.map((place: any) => (
            <Card key={place.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{place.name}</h4>
                    <p className="text-muted-foreground text-sm mb-2">
                      {place.destination_name}
                    </p>
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
                      className="w-20 h-20 object-cover rounded-lg ml-4"
                    />
                  )}
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  {place.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      {renderStars(place.rating)}
                      <span className="text-sm text-muted-foreground ml-1">
                        ({place.rating})
                      </span>
                    </div>
                  )}
                  
                  <Badge className={getPriorityColor(place.priority)}>
                    {getPriorityText(place.priority)}
                  </Badge>
                  
                  {place.category && (
                    <Badge variant="outline">{place.category}</Badge>
                  )}
                </div>

                {place.estimated_time && (
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    Tiempo estimado: {place.estimated_time}
                  </div>
                )}

                {canEdit && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
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