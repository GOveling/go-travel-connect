import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  X, 
  Phone, 
  MoreVertical, 
  MapPin,
  ArrowLeft,
  ExternalLink,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';
import { useActiveRoute } from '@/contexts/ActiveRouteContext';
import { useTravelModeContext } from '@/contexts/TravelModeContext';
import NavigationCard from './NavigationCard';
import RouteProgressIndicator from './RouteProgressIndicator';
import { hapticFeedbackService } from '@/services/HapticFeedbackService';
import { toast } from 'sonner';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface NavigationScreenProps {
  onClose: () => void;
  className?: string;
}

const MapController = ({ 
  bounds, 
  currentLocation 
}: { 
  bounds: LatLngBounds | null; 
  currentLocation: { lat: number; lng: number } | null;
}) => {
  const map = useMap();

  useEffect(() => {
    if (currentLocation && !bounds) {
      // Center on current location if no route bounds
      map.setView([currentLocation.lat, currentLocation.lng], 16);
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds, currentLocation]);

  return null;
};

const NavigationScreen: React.FC<NavigationScreenProps> = ({ onClose, className = "" }) => {
  const { 
    activeRoute, 
    currentLeg, 
    routeProgress, 
    isNavigating,
    pauseNavigation,
    resumeNavigation,
    completeCurrentLeg,
    endNavigation 
  } = useActiveRoute();
  
  const { currentPosition } = useTravelModeContext();
  const [isLandscape, setIsLandscape] = useState(false);
  const [mapBounds, setMapBounds] = useState<LatLngBounds | null>(null);
  const [isMapFocused, setIsMapFocused] = useState(true);

  // Handle orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscape(window.innerHeight < window.innerWidth);
    };

    handleOrientationChange();
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Calculate map bounds for current leg
  useEffect(() => {
    if (currentLeg && currentPosition) {
      const bounds = new LatLngBounds([]);
      
      // Add current position
      bounds.extend([currentPosition.lat, currentPosition.lng]);
      
      // Add leg destination
      bounds.extend([
        currentLeg.destination.location.lat, 
        currentLeg.destination.location.lng
      ]);

      // Add route coordinates if available
      if (currentLeg.result.coordinates && currentLeg.result.coordinates.length > 0) {
        currentLeg.result.coordinates.forEach(coord => {
          bounds.extend([coord.lat, coord.lng]);
        });
      }

      setMapBounds(bounds);
    }
  }, [currentLeg, currentPosition]);

  const handleStepComplete = useCallback(async (stepIndex: number) => {
    await hapticFeedbackService.trigger('turn_important');
    toast.success('Paso completado');
  }, []);

  const handleLegComplete = useCallback(async () => {
    await hapticFeedbackService.trigger('leg_complete');
    completeCurrentLeg();
    toast.success('Destino alcanzado!');
  }, [completeCurrentLeg]);

  const handleExternalNavigation = useCallback(() => {
    if (!currentLeg) return;

    const destination = currentLeg.destination.location;
    const mode = currentLeg.mode;
    
    // Construct external navigation URL
    const baseUrl = 'https://www.google.com/maps/dir/';
    const origin = currentPosition ? `${currentPosition.lat},${currentPosition.lng}` : '';
    const dest = `${destination.lat},${destination.lng}`;
    const travelMode = mode === 'driving' ? 'driving' : 
                     mode === 'transit' ? 'transit' : 'walking';
    
    const url = `${baseUrl}${origin}/${dest}/@${dest},15z/data=!3m1!4b1!4m2!4m1!3e${
      travelMode === 'driving' ? '0' : travelMode === 'transit' ? '3' : '2'
    }`;

    window.open(url, '_blank');
    
    toast.success('Abriendo navegación externa');
  }, [currentLeg, currentPosition]);

  const handlePauseResume = useCallback(async () => {
    if (isNavigating) {
      pauseNavigation();
      await hapticFeedbackService.trigger('navigation_start');
      toast.info('Navegación pausada');
    } else {
      resumeNavigation();
      await hapticFeedbackService.trigger('navigation_start');
      toast.success('Navegación reanudada');
    }
  }, [isNavigating, pauseNavigation, resumeNavigation]);

  const handleEndNavigation = useCallback(async () => {
    endNavigation();
    await hapticFeedbackService.trigger('recalculation');
    toast.info('Navegación finalizada');
    onClose();
  }, [endNavigation, onClose]);

  if (!activeRoute || !currentLeg) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <Card className="p-6 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin navegación activa</h3>
          <p className="text-muted-foreground mb-4">
            No hay una ruta de navegación activa en este momento.
          </p>
          <Button onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Card>
      </div>
    );
  }

  const getTransportModeColor = (mode: string) => {
    switch (mode) {
      case 'driving': return 'bg-red-500';
      case 'transit': return 'bg-green-500';
      case 'bicycling': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getTransportModeText = (mode: string) => {
    switch (mode) {
      case 'driving': return 'Conduciendo';
      case 'transit': return 'Transporte';
      case 'bicycling': return 'Bicicleta';
      default: return 'Caminando';
    }
  };

  return (
    <div className={`fixed inset-0 bg-background z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary/80"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            <div>
              <h1 className="font-semibold text-sm">Navegando hacia</h1>
              <p className="text-xs opacity-90">{currentLeg.destination.name}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={`${getTransportModeColor(currentLeg.mode)} text-white`}
          >
            {getTransportModeText(currentLeg.mode)}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePauseResume}
            className="text-primary-foreground hover:bg-primary/80"
          >
            {isNavigating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className={`flex-1 relative ${isLandscape ? 'h-1/2' : 'h-2/3'}`}>
        <MapContainer
          bounds={mapBounds || undefined}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Current position marker */}
          {currentPosition && (
            <Marker position={[currentPosition.lat, currentPosition.lng]} />
          )}

          {/* Destination marker */}
          <Marker position={[
            currentLeg.destination.location.lat, 
            currentLeg.destination.location.lng
          ]} />

          {/* Route polyline */}
          {currentLeg.result.coordinates && currentLeg.result.coordinates.length > 0 && (
            <Polyline
              positions={currentLeg.result.coordinates.map(coord => [coord.lat, coord.lng] as [number, number])}
              color="#3b82f6"
              weight={5}
              opacity={0.8}
            />
          )}

          <MapController bounds={mapBounds} currentLocation={currentPosition} />
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExternalNavigation}
            className="bg-background/80 backdrop-blur-sm"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Route Progress Bar */}
        <div className="absolute bottom-4 left-4 right-4">
          <RouteProgressIndicator route={activeRoute} className="bg-background/90 backdrop-blur-sm" />
        </div>
      </div>

      {/* Navigation Instructions Panel */}
      <div className={`${isLandscape ? 'h-1/2' : 'h-1/3'} overflow-y-auto bg-muted/50`}>
        <div className="p-4 space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleLegComplete}
              className="flex-1"
            >
              <MapPin className="h-4 w-4 mr-2" />
              He llegado
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExternalNavigation}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={handleEndNavigation}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Card */}
          <NavigationCard
            leg={currentLeg}
            currentStepIndex={routeProgress?.current_step_index || 0}
            onCompleteStep={handleStepComplete}
            onStartExternalNavigation={handleExternalNavigation}
          />
        </div>
      </div>
    </div>
  );
};

export default NavigationScreen;