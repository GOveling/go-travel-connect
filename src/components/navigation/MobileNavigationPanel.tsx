// Mobile Navigation Panel - Swipeable, gesture-friendly navigation interface
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationLeg, NavigationStep } from '@/types/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Navigation, 
  Clock, 
  MapPin,
  Check,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationPanelProps {
  leg: NavigationLeg;
  currentStepIndex: number;
  isNavigating: boolean;
  onCompleteStep: (stepIndex: number) => void;
  onPauseResume: () => void;
  onCompleteLeg: () => void;
  className?: string;
}

export const MobileNavigationPanel: React.FC<MobileNavigationPanelProps> = ({
  leg,
  currentStepIndex,
  isNavigating,
  onCompleteStep,
  onPauseResume,
  onCompleteLeg,
  className = ""
}) => {
  const [displayStepIndex, setDisplayStepIndex] = useState(currentStepIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync display index with current step
  useEffect(() => {
    setDisplayStepIndex(currentStepIndex);
  }, [currentStepIndex]);

  const currentStep = leg.result.steps[displayStepIndex];
  const isCurrentStep = displayStepIndex === currentStepIndex;
  const isPastStep = displayStepIndex < currentStepIndex;

  // Handle touch gestures for step navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && displayStepIndex < leg.result.steps.length - 1) {
      setDisplayStepIndex(prev => prev + 1);
    }
    if (isRightSwipe && displayStepIndex > 0) {
      setDisplayStepIndex(prev => prev - 1);
    }
  }, [touchStart, touchEnd, displayStepIndex, leg.result.steps.length]);

  const navigateStep = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev' && displayStepIndex > 0) {
      setDisplayStepIndex(prev => prev - 1);
    }
    if (direction === 'next' && displayStepIndex < leg.result.steps.length - 1) {
      setDisplayStepIndex(prev => prev + 1);
    }
  }, [displayStepIndex, leg.result.steps.length]);

  const getStepStatusColor = () => {
    if (isPastStep) return 'bg-green-500';
    if (isCurrentStep) return 'bg-primary';
    return 'bg-muted';
  };

  const getTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'walking': return '🚶';
      case 'driving': return '🚗';
      case 'transit': return '🚌';
      case 'bicycling': return '🚴';
      default: return '📍';
    }
  };

  if (!currentStep) return null;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {/* Header with leg info */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {getTransportIcon(leg.mode)}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {leg.destination.name}
                </h3>
                <div className="flex items-center gap-4 text-blue-100 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {leg.result.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {leg.result.duration}
                  </span>
                </div>
              </div>
            </div>
            
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              Paso {displayStepIndex + 1} de {leg.result.steps.length}
            </Badge>
          </div>
        </div>

        {/* Step navigation */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateStep('prev')}
                disabled={displayStepIndex === 0}
                className="min-h-[44px] min-w-[44px]"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex-1 text-center">
                <div className="flex justify-center gap-1 mb-2">
                  {leg.result.steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 rounded-full transition-all duration-200",
                      index === displayStepIndex ? "w-8 bg-primary" :
                      index < currentStepIndex ? "w-2 bg-green-500" :
                      "w-2 bg-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Desliza para navegar entre pasos
              </p>
            </div>
            
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateStep('next')}
                disabled={displayStepIndex === leg.result.steps.length - 1}
                className="min-h-[44px] min-w-[44px]"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
          </div>
        </div>

        {/* Current step display */}
        <div 
          ref={panelRef}
          className="p-6 min-h-[200px] touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg",
              getStepStatusColor()
            )}>
              {isPastStep ? <Check className="h-6 w-6" /> : displayStepIndex + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-lg font-medium leading-relaxed mb-3">
                {currentStep.instruction}
              </p>
              
              {/* Step details */}
              <div className="space-y-3">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="font-medium">{currentStep.distance}</span>
                  <span>•</span>
                  <span className="font-medium">{currentStep.duration}</span>
                </div>
                
                {/* Transit details */}
                {currentStep.type === 'transit' && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <span className="text-lg">🚌</span>
                      {currentStep.transit_details.line.name}
                    </div>
                    {currentStep.transit_details.departure_stop && (
                      <p className="text-xs text-muted-foreground">
                        Desde: {currentStep.transit_details.departure_stop.name}
                      </p>
                    )}
                    {currentStep.transit_details.arrival_stop && (
                      <p className="text-xs text-muted-foreground">
                        Hasta: {currentStep.transit_details.arrival_stop.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 bg-muted/30 border-t">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onPauseResume}
              className="flex-1 min-h-[52px] text-base"
            >
              {isNavigating ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Continuar
                </>
              )}
            </Button>
            
            {isCurrentStep && (
              <Button
                onClick={() => onCompleteStep(currentStepIndex)}
                className="flex-1 min-h-[52px] text-base"
              >
                <Check className="h-5 w-5 mr-2" />
                Completar Paso
              </Button>
            )}
            
            {displayStepIndex === leg.result.steps.length - 1 && (
              <Button
                onClick={onCompleteLeg}
                variant="default"
                className="flex-1 min-h-[52px] text-base bg-green-600 hover:bg-green-700"
              >
                <Navigation className="h-5 w-5 mr-2" />
                Llegué
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};