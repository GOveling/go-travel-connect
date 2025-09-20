import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  Plane, 
  Car, 
  Train, 
  Bus,
  Bike,
  Wallet,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { useGoogleDirections } from '@/hooks/useGoogleDirections';
import type { OptimizedPlace } from '@/types/aiSmartRoute';
import type { DirectionsResult } from '@/hooks/useGoogleDirections';

interface DetailedNavigationPanelProps {
  places: OptimizedPlace[];
  transportMode: 'walk' | 'drive' | 'transit' | 'bike';
  onNavigateToPlace: (place: OptimizedPlace) => void;
  onStartFullRoute: () => void;
}

interface EnrichedRouteSegment {
  from: OptimizedPlace;
  to: OptimizedPlace;
  directions: DirectionsResult | null;
  estimatedCost: number;
  alternativeModes: Array<{
    mode: string;
    duration: string;
    cost: number;
    icon: React.ReactNode;
  }>;
  isIntercity: boolean;
}

const getTransportIcon = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'walking': return <MapPin className="h-4 w-4" />;
    case 'driving': return <Car className="h-4 w-4" />;
    case 'transit': return <Bus className="h-4 w-4" />;
    case 'flight': return <Plane className="h-4 w-4" />;
    case 'train': return <Train className="h-4 w-4" />;
    case 'bike': return <Bike className="h-4 w-4" />;
    default: return <Navigation className="h-4 w-4" />;
  }
};

const estimateTransportCost = (distance: string, mode: string): number => {
  const distanceKm = parseFloat(distance.replace(/[^\d.]/g, ''));
  
  switch (mode.toLowerCase()) {
    case 'walking': return 0;
    case 'bike': return 0;
    case 'transit': return Math.min(distanceKm * 0.5, 10); // Base transit fare
    case 'driving': return distanceKm * 0.15; // Gas + tolls estimate
    case 'flight': return distanceKm > 100 ? 150 : 0; // Rough flight estimate
    default: return 0;
  }
};

const DetailedNavigationPanel: React.FC<DetailedNavigationPanelProps> = ({
  places,
  transportMode,
  onNavigateToPlace,
  onStartFullRoute
}) => {
  const { getDirections, calculateItineraryRoutes, isLoading } = useGoogleDirections();
  const [routeSegments, setRouteSegments] = useState<EnrichedRouteSegment[]>([]);
  const [expandedSegments, setExpandedSegments] = useState<Set<number>>(new Set());
  const [totalCost, setTotalCost] = useState(0);
  const [totalDuration, setTotalDuration] = useState('0 min');

  useEffect(() => {
    if (places.length < 2) return;

    const loadRouteData = async () => {
      const segments: EnrichedRouteSegment[] = [];
      let cost = 0;
      let totalMinutes = 0;

      for (let i = 0; i < places.length - 1; i++) {
        const from = places[i];
        const to = places[i + 1];

        const directions = await getDirections({
          origin: { lat: from.lat, lng: from.lng },
          destination: { lat: to.lat, lng: to.lng },
          mode: transportMode === 'bike' ? 'bicycling' : transportMode === 'drive' ? 'driving' : transportMode === 'walk' ? 'walking' : transportMode
        });

        const segmentCost = directions ? estimateTransportCost(directions.distance, transportMode) : 0;
        cost += segmentCost;

        if (directions?.duration) {
          const minutes = parseInt(directions.duration.match(/\d+/)?.[0] || '0');
          totalMinutes += minutes;
        }

        // Generate alternative transport modes
        const alternativeModes = [
          { mode: 'walking', duration: '25 min', cost: 0, icon: <MapPin className="h-4 w-4" /> },
          { mode: 'transit', duration: '15 min', cost: 2.5, icon: <Bus className="h-4 w-4" /> },
          { mode: 'driving', duration: '12 min', cost: 5, icon: <Car className="h-4 w-4" /> },
        ].filter(alt => alt.mode !== transportMode);

        segments.push({
          from,
          to,
          directions,
          estimatedCost: segmentCost,
          alternativeModes,
          isIntercity: from.destinationName !== to.destinationName
        });
      }

      setRouteSegments(segments);
      setTotalCost(cost);
      setTotalDuration(`${Math.round(totalMinutes)} min`);
    };

    loadRouteData();
  }, [places, transportMode, getDirections]);

  const toggleSegment = (index: number) => {
    setExpandedSegments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const openExternalNavigation = (segment: EnrichedRouteSegment) => {
    const url = `https://www.google.com/maps/dir/${segment.from.lat},${segment.from.lng}/${segment.to.lat},${segment.to.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              {getTransportIcon(transportMode)}
              Detailed Navigation
            </span>
            <Badge variant="outline" className="bg-white">
              {places.length} stops
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">
                <span className="font-medium">Total time:</span> {totalDuration}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                <span className="font-medium">Est. cost:</span> ${totalCost.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={onStartFullRoute}
              className="flex-1"
              size="sm"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start Full Route
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const waypoints = places.map(p => `${p.lat},${p.lng}`).join('|');
                window.open(`https://www.google.com/maps/dir/${waypoints}`, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Route Segments */}
      <div className="space-y-3">
        {routeSegments.map((segment, index) => (
          <Card key={index} className={`transition-all ${segment.isIntercity ? 'border-orange-200 bg-orange-50' : ''}`}>
            <Collapsible 
              open={expandedSegments.has(index)}
              onOpenChange={() => toggleSegment(index)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {segment.from.name} → {segment.to.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {segment.directions && (
                            <>
                              <span>{segment.directions.duration}</span>
                              <span>•</span>
                              <span>{segment.directions.distance}</span>
                              <span>•</span>
                              <span>${segment.estimatedCost.toFixed(2)}</span>
                            </>
                          )}
                          {segment.isIntercity && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Intercity
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTransportIcon(transportMode)}
                      {expandedSegments.has(index) ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  {segment.directions ? (
                    <div className="space-y-4">
                      {/* Step-by-step directions */}
                      <div>
                        <h5 className="font-medium text-sm mb-2">Turn-by-Turn Directions</h5>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {segment.directions.steps.slice(0, 10).map((step, stepIndex) => (
                            <div key={stepIndex} className="flex items-start gap-2 text-xs">
                              <div className="w-4 h-4 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                                {stepIndex + 1}
                              </div>
                              <div className="flex-1">
                                <div className="text-muted-foreground" 
                                     dangerouslySetInnerHTML={{ __html: step.instruction }} 
                                />
                                <div className="text-xs text-muted-foreground mt-1">
                                  {step.distance} • {step.duration}
                                </div>
                              </div>
                            </div>
                          ))}
                          {segment.directions.steps.length > 10 && (
                            <div className="text-xs text-muted-foreground text-center py-2">
                              +{segment.directions.steps.length - 10} more steps...
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Alternative transport modes */}
                      <div>
                        <h5 className="font-medium text-sm mb-2">Alternative Transport</h5>
                        <div className="grid grid-cols-1 gap-2">
                          {segment.alternativeModes.map((alt, altIndex) => (
                            <div key={altIndex} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                              <div className="flex items-center gap-2">
                                {alt.icon}
                                <span className="capitalize">{alt.mode}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span>{alt.duration}</span>
                                <span>•</span>
                                <span>${alt.cost.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onNavigateToPlace(segment.to)}
                          className="flex-1"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Navigate to {segment.to.name}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openExternalNavigation(segment)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="text-sm">
                        {isLoading(segment.from, segment.to, transportMode) ? 
                          'Loading directions...' : 
                          'Unable to load directions'
                        }
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DetailedNavigationPanel;