import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation, TrendingUp, RotateCcw, ArrowUp } from 'lucide-react';
import { compassService } from '@/services/compassService';
interface SavedPlace {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  category?: string;
}

interface DirectionalGuidanceProps {
  userLocation: { lat: number; lng: number } | null;
  targetPlace: (SavedPlace & { distance: number }) | null;
  isEnabled: boolean;
}

export const DirectionalGuidance: React.FC<DirectionalGuidanceProps> = ({
  userLocation,
  targetPlace,
  isEnabled
}) => {
  const [guidance, setGuidance] = useState<{
    text: string;
    direction: 'left' | 'right' | 'straight';
    angle: number;
    heading: number;
    cardinal: string;
  } | null>(null);
  const [compassSupported, setCompassSupported] = useState(false);

  useEffect(() => {
    const initializeCompass = async () => {
      const supported = await compassService.initialize();
      setCompassSupported(supported);
      
      if (supported && isEnabled) {
        compassService.startWatching((compassData) => {
          updateGuidance(compassData.heading);
        });
      }
    };

    initializeCompass();

    return () => {
      compassService.stopWatching();
    };
  }, [isEnabled]);

  useEffect(() => {
    if (compassSupported && userLocation && targetPlace && targetPlace.distance < 150) {
      updateGuidance(compassService.getCurrentHeading());
    } else {
      setGuidance(null);
    }
  }, [userLocation, targetPlace, compassSupported]);

  const updateGuidance = (currentHeading: number) => {
    if (!userLocation || !targetPlace || !targetPlace.lat || !targetPlace.lng) return;

    const directionalGuidance = compassService.getDirectionalGuidance(
      userLocation.lat,
      userLocation.lng,
      targetPlace.lat,
      targetPlace.lng,
      targetPlace.distance
    );

    setGuidance({
      text: directionalGuidance.guidanceText,
      direction: directionalGuidance.turnDirection,
      angle: directionalGuidance.turnAngle,
      heading: currentHeading,
      cardinal: compassService.getCardinalDirection(currentHeading)
    });
  };

  if (!compassSupported || !isEnabled || !guidance || !targetPlace) {
    return null;
  }

  const getDirectionIcon = () => {
    switch (guidance.direction) {
      case 'left':
        return <RotateCcw className="w-5 h-5 rotate-90" />;
      case 'right':
        return <RotateCcw className="w-5 h-5 -rotate-90" />;
      default:
        return <ArrowUp className="w-5 h-5" />;
    }
  };

  const getDirectionColor = () => {
    switch (guidance.direction) {
      case 'left':
        return 'bg-blue-500';
      case 'right':
        return 'bg-green-500';
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full text-white ${getDirectionColor()}`}>
            {getDirectionIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-800 dark:text-blue-200">
                To {targetPlace.name}
              </span>
            </div>
            
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {guidance.text}
            </p>
          </div>

          <div className="text-right">
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300">
              <TrendingUp className="w-3 h-3 mr-1" />
              {guidance.cardinal}
            </Badge>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {Math.round(guidance.heading)}°
            </div>
          </div>
        </div>

        {guidance.angle > 30 && (
          <div className="mt-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded text-xs text-yellow-800 dark:text-yellow-200">
            Large turn required - consider checking your route
          </div>
        )}
      </CardContent>
    </Card>
  );
};