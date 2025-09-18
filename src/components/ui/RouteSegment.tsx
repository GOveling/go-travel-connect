import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Navigation, 
  Car, 
  MapPin, 
  Clock, 
  Route,
  Train,
  Bike,
  Play
} from "lucide-react";
import { DirectionsResult } from "@/hooks/useGoogleDirections";

interface RouteSegmentProps {
  from: string;
  to: string;
  mode: 'walking' | 'driving' | 'transit' | 'bicycling';
  result?: DirectionsResult;
  loading?: boolean;
  error?: string;
  showDetails?: boolean;
  onStartNavigation?: () => void;
}

const RouteSegment: React.FC<RouteSegmentProps> = ({
  from,
  to,
  mode,
  result,
  loading,
  error,
  showDetails = false,
  onStartNavigation
}) => {
  const getTransportIcon = () => {
    switch (mode) {
      case 'driving': return <Car className="h-4 w-4" />;
      case 'transit': return <Train className="h-4 w-4" />;
      case 'bicycling': return <Bike className="h-4 w-4" />;
      default: return <Navigation className="h-4 w-4" />;
    }
  };

  const getTransportLabel = () => {
    switch (mode) {
      case 'driving': return 'Conduciendo';
      case 'transit': return 'Transporte público';
      case 'bicycling': return 'Bicicleta';
      default: return 'Caminando';
    }
  };

  const getTransportColor = () => {
    switch (mode) {
      case 'driving': return 'bg-red-500';
      case 'transit': return 'bg-green-500';
      case 'bicycling': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <Card className="border-l-4 border-l-muted">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                Calculando ruta de <span className="font-medium">{from}</span> a <span className="font-medium">{to}</span>...
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-l-4 border-l-destructive">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-destructive" />
            <div className="flex-1">
              <div className="text-sm font-medium text-destructive">Error calculando ruta</div>
              <div className="text-xs text-muted-foreground">{error}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Card className={`border-l-4 ${getTransportColor()} border-l-2`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTransportIcon()}
              <Badge variant="secondary" className="text-xs">
                {getTransportLabel()}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {result.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Route className="h-3 w-3" />
                  {result.distance}
                </div>
              </div>
              {onStartNavigation && (
                <Button
                  size="sm"
                  onClick={onStartNavigation}
                  className="h-7 px-2 text-xs"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Navegar
                </Button>
              )}
            </div>
          </div>

          {/* Route description */}
          <div className="text-sm">
            <span className="text-muted-foreground">De </span>
            <span className="font-medium">{from}</span>
            <span className="text-muted-foreground"> a </span>
            <span className="font-medium">{to}</span>
          </div>

          {/* Detailed instructions */}
          {showDetails && result.steps.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Instrucciones paso a paso
              </div>
              <div className="space-y-1">
                {result.steps.slice(0, 3).map((step, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    <span className="inline-block w-4 text-center font-medium">
                      {index + 1}.
                    </span>
                    <span className="ml-1">{step.instruction}</span>
                    <span className="ml-2 text-primary">({step.distance})</span>
                  </div>
                ))}
                {result.steps.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    ... y {result.steps.length - 3} pasos más
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteSegment;