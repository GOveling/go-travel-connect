// Navigation Card - Turn-by-turn navigation UI component

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Route, 
  RotateCcw,
  RotateCw,
  ArrowUp,
  ExternalLink,
  Bus,
  Train,
  Car,
  Footprints,
  Bike
} from 'lucide-react';
import { NavigationStep, NavigationLeg } from '@/types/navigation';

interface NavigationCardProps {
  leg: NavigationLeg;
  currentStepIndex?: number;
  onStartExternalNavigation?: () => void;
  onCompleteStep?: (stepIndex: number) => void;
  showSteps?: boolean;
  className?: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({
  leg,
  currentStepIndex = 0,
  onStartExternalNavigation,
  onCompleteStep,
  showSteps = true,
  className = ""
}) => {
  
  // Get transport icon
  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'walking': return <Footprints className="w-4 h-4" />;
      case 'driving': return <Car className="w-4 h-4" />;
      case 'transit': return <Bus className="w-4 h-4" />;
      case 'bicycling': return <Bike className="w-4 h-4" />;
      default: return <Navigation className="w-4 h-4" />;
    }
  };

  // Get transport color
  const getTransportColor = (mode: string) => {
    switch (mode) {
      case 'walking': return 'bg-green-500';
      case 'driving': return 'bg-blue-500';
      case 'transit': return 'bg-purple-500';
      case 'bicycling': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Get maneuver icon
  const getManeuverIcon = (maneuver?: string) => {
    if (!maneuver) return <ArrowUp className="w-4 h-4" />;
    
    switch (maneuver.toLowerCase()) {
      case 'turn-left':
      case 'turn-slight-left':
        return <RotateCcw className="w-4 h-4" />;
      case 'turn-right':
      case 'turn-slight-right':
        return <RotateCw className="w-4 h-4" />;
      default:
        return <ArrowUp className="w-4 h-4" />;
    }
  };

  // Get step icon for transit
  const getTransitIcon = (vehicleType?: string) => {
    switch (vehicleType?.toLowerCase()) {
      case 'bus': return <Bus className="w-4 h-4" />;
      case 'subway':
      case 'train': return <Train className="w-4 h-4" />;
      default: return <Bus className="w-4 h-4" />;
    }
  };

  const renderStep = (step: NavigationStep, index: number) => {
    const isCurrentStep = index === currentStepIndex;
    const isPastStep = index < currentStepIndex;
    
    return (
      <div
        key={index}
        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
          isCurrentStep 
            ? 'bg-primary/10 border-primary' 
            : isPastStep 
              ? 'bg-muted/50 border-muted opacity-60' 
              : 'bg-background border-border'
        }`}
      >
        {/* Step Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isCurrentStep 
            ? 'bg-primary text-primary-foreground' 
            : isPastStep 
              ? 'bg-muted text-muted-foreground' 
              : 'bg-secondary text-secondary-foreground'
        }`}>
          {step.type === 'transit' ? (
            getTransitIcon(step.transit_details?.line?.vehicle?.type)
          ) : (
            getManeuverIcon(step.maneuver)
          )}
        </div>

        {/* Step Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={`text-sm ${isCurrentStep ? 'font-medium' : ''}`}>
                {step.instruction}
              </p>
              
              {step.type === 'transit' && step.transit_details && (
                <div className="mt-2 space-y-1">
                  {/* Transit Line Info */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                      style={{ 
                        backgroundColor: step.transit_details.line?.color || '#666',
                        color: '#fff'
                      }}
                    >
                      {step.transit_details.line?.short_name || step.transit_details.line?.name}
                    </Badge>
                    {step.transit_details.headsign && (
                      <span className="text-xs text-muted-foreground">
                        hacia {step.transit_details.headsign}
                      </span>
                    )}
                  </div>
                  
                  {/* Stop Information */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    {step.transit_details.departure_stop && (
                      <div>
                        📍 Salida: {step.transit_details.departure_stop.name}
                        {step.transit_details.departure_time && (
                          <span className="ml-2">🕐 {step.transit_details.departure_time.text}</span>
                        )}
                      </div>
                    )}
                    {step.transit_details.arrival_stop && (
                      <div>
                        🎯 Llegada: {step.transit_details.arrival_stop.name}
                        {step.transit_details.arrival_time && (
                          <span className="ml-2">🕐 {step.transit_details.arrival_time.text}</span>
                        )}
                      </div>
                    )}
                    {step.transit_details.num_stops && (
                      <div>🚏 {step.transit_details.num_stops} paradas</div>
                    )}
                  </div>
                </div>
              )}
              
              {step.type !== 'transit' && step.street_name && (
                <p className="text-xs text-muted-foreground mt-1">
                  en {step.street_name}
                </p>
              )}
            </div>

            {/* Distance and Duration */}
            <div className="text-right text-xs text-muted-foreground">
              <div>{step.distance}</div>
              <div>{step.duration}</div>
            </div>
          </div>

          {/* Complete Step Button */}
          {isCurrentStep && onCompleteStep && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCompleteStep(index)}
              className="mt-2"
            >
              Completar paso
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${getTransportColor(leg.mode)} text-white`}>
              {getTransportIcon(leg.mode)}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {leg.origin.name} → {leg.destination.name}
              </h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Route className="w-3 h-3" />
                  {leg.result.distance}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {leg.result.duration}
                </span>
                {leg.result.fare && (
                  <span className="text-primary font-medium">
                    {leg.result.fare.text}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* External Navigation Button */}
          {onStartExternalNavigation && (
            <Button
              size="sm"
              variant="outline"
              onClick={onStartExternalNavigation}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Abrir en Maps
            </Button>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge variant={
            leg.status === 'active' ? 'default' :
            leg.status === 'completed' ? 'secondary' :
            leg.status === 'skipped' ? 'destructive' :
            'outline'
          }>
            {leg.status === 'active' ? 'En progreso' :
             leg.status === 'completed' ? 'Completado' :
             leg.status === 'skipped' ? 'Omitido' :
             'Pendiente'}
          </Badge>
          
          {leg.result.warnings && leg.result.warnings.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              ⚠️ Avisos ({leg.result.warnings.length})
            </Badge>
          )}
        </div>
      </CardHeader>

      {showSteps && leg.result.steps.length > 0 && (
        <>
          <Separator />
          <CardContent className="pt-3">
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Instrucciones ({leg.result.steps.length} pasos)
              </h4>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {leg.result.steps.map((step, index) => renderStep(step, index))}
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default NavigationCard;