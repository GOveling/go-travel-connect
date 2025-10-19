// Route Progress Indicator - Visual progress display for navigation

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  Route, 
  Navigation,
  Flag,
  CheckCircle,
  Circle,
  AlertTriangle
} from 'lucide-react';
import { ActiveRoute, NavigationLeg } from '@/types/navigation';

interface RouteProgressIndicatorProps {
  route: ActiveRoute;
  className?: string;
}

const RouteProgressIndicator: React.FC<RouteProgressIndicatorProps> = ({
  route,
  className = ""
}) => {
  
  const completedLegs = route.legs.filter(leg => leg.status === 'completed').length;
  const totalLegs = route.legs.length;
  const progressPercentage = (completedLegs / totalLegs) * 100;

  const getLegStatusIcon = (status: NavigationLeg['status'], isActive: boolean) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'active':
        return <Navigation className="w-4 h-4 text-primary animate-pulse" />;
      case 'skipped':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getLegStatusColor = (status: NavigationLeg['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'active': return 'text-primary';
      case 'skipped': return 'text-orange-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Route Overview */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">Progreso de Ruta</h3>
              <p className="text-xs text-muted-foreground">
                {completedLegs} de {totalLegs} tramos completados
              </p>
            </div>
          </div>
          
          <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
            {route.status === 'active' ? 'En progreso' :
             route.status === 'completed' ? 'Completada' :
             route.status === 'paused' ? 'Pausada' :
             'Inactiva'}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progressPercentage)}% completado</span>
            <span>{route.total_duration}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Route Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Route className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Distancia:</span>
            <span className="font-medium">{route.total_distance}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tiempo:</span>
            <span className="font-medium">{route.total_duration}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Legs Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Tramos</h4>
          
          <div className="space-y-2">
            {route.legs.map((leg, index) => {
              const isCurrentLeg = index === route.current_leg_index;
              
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    isCurrentLeg ? 'bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getLegStatusIcon(leg.status, isCurrentLeg)}
                  </div>

                  {/* Leg Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${
                          isCurrentLeg ? 'font-medium' : ''
                        } ${getLegStatusColor(leg.status)}`}>
                          {index + 1}. {leg.destination.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          desde {leg.origin.name}
                        </p>
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{leg.result.distance}</div>
                        <div>{leg.result.duration}</div>
                      </div>
                    </div>

                    {/* ETA/Timestamps */}
                    {(leg.estimated_arrival_time || leg.actual_arrival_time) && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {leg.actual_arrival_time ? (
                          <span>✅ Llegada: {new Date(leg.actual_arrival_time).toLocaleTimeString()}</span>
                        ) : leg.estimated_arrival_time ? (
                          <span>⏰ ETA: {leg.estimated_arrival_time}</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Location Info */}
        {route.status === 'active' && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                Destino actual: {route.legs[route.current_leg_index]?.destination.name || 'N/A'}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteProgressIndicator;