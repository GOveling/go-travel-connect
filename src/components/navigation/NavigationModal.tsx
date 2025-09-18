import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Navigation,
  Car,
  MapPin,
  Clock,
  Route,
  Train,
  Bike,
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  CornerDownLeft,
  CornerDownRight,
} from "lucide-react";
import { RouteSegment, DirectionsStep } from "@/hooks/useGoogleDirections";
import { UserLocation } from "@/hooks/useUserLocation";
import { calculateDistance } from "@/utils/locationUtils";

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeSegments: RouteSegment[];
  userLocation?: UserLocation | null;
  transportMode: 'walking' | 'driving' | 'transit' | 'bicycling';
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  isOpen,
  onClose,
  routeSegments,
  userLocation,
  transportMode,
}) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);

  // Get all steps from all segments
  const allSteps = routeSegments.flatMap((segment, segmentIdx) =>
    segment.result.steps.map((step, stepIdx) => ({
      ...step,
      segmentIndex: segmentIdx,
      stepIndex: stepIdx,
      fromPlace: segment.from,
      toPlace: segment.to,
      mode: segment.mode,
    }))
  );

  const currentStep = allSteps[currentStepIndex] || null;
  const totalSteps = allSteps.length;
  const progressPercentage = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  // Get transport icon
  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'driving': return <Car className="h-5 w-5" />;
      case 'transit': return <Train className="h-5 w-5" />;
      case 'bicycling': return <Bike className="h-5 w-5" />;
      default: return <Navigation className="h-5 w-5" />;
    }
  };

  // Get direction icon based on instruction
  const getDirectionIcon = (instruction: string) => {
    const lowerInstruction = instruction.toLowerCase();
    if (lowerInstruction.includes('right') || lowerInstruction.includes('derecha')) {
      return <CornerDownRight className="h-8 w-8 text-primary" />;
    }
    if (lowerInstruction.includes('left') || lowerInstruction.includes('izquierda')) {
      return <CornerDownLeft className="h-8 w-8 text-primary" />;
    }
    if (lowerInstruction.includes('straight') || lowerInstruction.includes('recto')) {
      return <ArrowUp className="h-8 w-8 text-primary" />;
    }
    return <ArrowUp className="h-8 w-8 text-primary" />;
  };

  // Auto-advance based on location proximity
  useEffect(() => {
    if (!userLocation || !currentStep) return;

    // For demo purposes, we'll simulate proximity detection
    // In a real app, you'd compare with actual step coordinates
    const checkProximity = () => {
      // Simulate advancing every 10 seconds for demo
      // In reality, you'd check if user is within 50m of next turn
    };

    const interval = setInterval(checkProximity, 1000);
    return () => clearInterval(interval);
  }, [userLocation, currentStep]);

  // Voice navigation
  const speakInstruction = useCallback((instruction: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  // Speak current instruction when it changes
  useEffect(() => {
    if (currentStep && voiceEnabled) {
      speakInstruction(currentStep.instruction);
    }
  }, [currentStep, voiceEnabled, speakInstruction]);

  const goToNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinishNavigation = () => {
    if (voiceEnabled) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  if (!currentStep) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleFinishNavigation}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {getTransportIcon(currentStep.mode)}
              Navegación Activa
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="h-8 w-8 p-0"
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFinishNavigation}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Progress bar */}
          <div className="px-6 py-3 border-b bg-muted/30">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Paso {currentStepIndex + 1} de {totalSteps}</span>
              <span>{Math.round(progressPercentage)}% completado</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Current instruction */}
          <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-lg">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {getDirectionIcon(currentStep.instruction)}
                </div>
                <h3 className="text-xl font-semibold mb-2 leading-relaxed">
                  {currentStep.instruction}
                </h3>
                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Route className="h-4 w-4" />
                    {currentStep.distance}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {currentStep.duration}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Route context */}
          <div className="px-6 py-3 border-t bg-muted/30">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Hacia:</span>
                <span className="font-medium">{currentStep.toPlace}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {currentStep.mode === 'walking' ? 'Caminando' :
                 currentStep.mode === 'driving' ? 'Conduciendo' :
                 currentStep.mode === 'transit' ? 'Transporte público' : 'Bicicleta'}
              </Badge>
            </div>
          </div>

          {/* Navigation controls */}
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowAllSteps(!showAllSteps)}
                className="text-sm"
              >
                {showAllSteps ? 'Ocultar' : 'Ver'} todos los pasos
              </Button>

              <Button
                onClick={goToNextStep}
                disabled={currentStepIndex === totalSteps - 1}
                className="flex items-center gap-2"
              >
                {currentStepIndex === totalSteps - 1 ? 'Finalizar' : 'Siguiente'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* All steps overlay */}
          {showAllSteps && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex flex-col">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Todos los pasos</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllSteps(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-3">
                  {allSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        index === currentStepIndex
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setCurrentStepIndex(index);
                        setShowAllSteps(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{step.instruction}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{step.distance}</span>
                            <span>•</span>
                            <span>{step.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};