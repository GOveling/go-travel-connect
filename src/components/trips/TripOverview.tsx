import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Edit } from 'lucide-react';

interface TripOverviewProps {
  trip: any;
  userRole: string;
  onUpdate: (updatedTrip: any) => void;
}

export const TripOverview = ({ trip, userRole, onUpdate }: TripOverviewProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = userRole === 'owner' || userRole === 'editor';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Planificando';
      case 'active': return 'En curso';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">{trip.name}</CardTitle>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(trip.status)}>
              {getStatusText(trip.status)}
            </Badge>
            {trip.is_group_trip && (
              <Badge variant="outline">Viaje en grupo</Badge>
            )}
          </div>

          {trip.description && (
            <p className="text-muted-foreground">{trip.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Destino</p>
                <p className="text-sm text-muted-foreground">
                  {Array.isArray(trip.destination) 
                    ? trip.destination.join(', ') 
                    : 'Multiple destinos'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fechas</p>
                <p className="text-sm text-muted-foreground">{trip.dates}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Viajeros</p>
                <p className="text-sm text-muted-foreground">{trip.travelers} personas</p>
              </div>
            </div>
          </div>

          {trip.budget && (
            <div>
              <p className="text-sm font-medium mb-1">Presupuesto</p>
              <p className="text-sm text-muted-foreground">{trip.budget}</p>
            </div>
          )}

          {trip.accommodation && (
            <div>
              <p className="text-sm font-medium mb-1">Alojamiento</p>
              <p className="text-sm text-muted-foreground">{trip.accommodation}</p>
            </div>
          )}

          {trip.transportation && (
            <div>
              <p className="text-sm font-medium mb-1">Transporte</p>
              <p className="text-sm text-muted-foreground">{trip.transportation}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};