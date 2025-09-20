import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  MapPin, 
  Clock, 
  Star,
  Wallet,
  Calendar,
  Thermometer,
  Users,
  Camera,
  Wifi,
  Car,
  ChevronDown,
  ChevronUp,
  Navigation,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import type { OptimizedPlace } from '@/types/aiSmartRoute';
import { getPriorityColor } from '@/utils/aiSmartRoute';

interface EnrichedPlaceCardProps {
  place: OptimizedPlace;
  index: number;
  onNavigate: (place: OptimizedPlace) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

interface PlaceEnrichment {
  weather: {
    temperature: string;
    condition: string;
    icon: string;
  };
  openingHours: {
    isOpen: boolean;
    hours: string;
    nextChange: string;
  };
  crowdLevel: {
    level: 'low' | 'medium' | 'high';
    description: string;
  };
  estimatedCosts: {
    entry: number;
    food: number;
    parking: number;
  };
  amenities: string[];
  photos: string[];
  tips: string[];
  accessibility: {
    wheelchairAccessible: boolean;
    notes: string;
  };
}

const generateMockEnrichment = (place: OptimizedPlace): PlaceEnrichment => {
  // Mock data generation based on place category and time
  const now = new Date();
  const hour = now.getHours();
  
  return {
    weather: {
      temperature: '22°C',
      condition: 'Sunny',
      icon: '☀️'
    },
    openingHours: {
      isOpen: hour >= 9 && hour < 18,
      hours: '9:00 AM - 6:00 PM',
      nextChange: hour < 9 ? 'Opens at 9:00 AM' : hour >= 18 ? 'Closed' : 'Closes at 6:00 PM'
    },
    crowdLevel: {
      level: hour >= 12 && hour <= 14 ? 'high' : hour >= 10 && hour <= 16 ? 'medium' : 'low',
      description: hour >= 12 && hour <= 14 ? 'Very busy lunch hours' : 'Moderate crowds expected'
    },
    estimatedCosts: {
      entry: place.category === 'Museum' ? 15 : place.category === 'Restaurant' ? 0 : 10,
      food: place.category === 'Restaurant' ? 25 : 8,
      parking: 5
    },
    amenities: [
      'WiFi Available',
      'Restrooms',
      place.category === 'Restaurant' ? 'Outdoor Seating' : 'Gift Shop',
      'Photography Allowed'
    ],
    photos: [
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg'
    ],
    tips: [
      'Best visited in the morning for fewer crowds',
      'Bring cash as some vendors may not accept cards',
      'Allow extra time for photos - very scenic location'
    ],
    accessibility: {
      wheelchairAccessible: true,
      notes: 'Fully accessible with ramps and elevators'
    }
  };
};

const getCrowdLevelColor = (level: string) => {
  switch (level) {
    case 'low': return 'bg-green-100 text-green-700 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'high': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const EnrichedPlaceCard: React.FC<EnrichedPlaceCardProps> = ({
  place,
  index,
  onNavigate,
  isExpanded = false,
  onToggleExpand
}) => {
  const [enrichment, setEnrichment] = useState<PlaceEnrichment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for enriched data
    const timer = setTimeout(() => {
      setEnrichment(generateMockEnrichment(place));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [place]);

  const getExternalMapsUrl = () => {
    return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="font-semibold text-base leading-tight">{place.name}</h5>
                  {onToggleExpand && (
                    <div className="flex-shrink-0">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {place.priority && (
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(place.priority)}`}>
                      {place.priority}
                    </Badge>
                  )}
                  {place.category && (
                    <Badge variant="secondary" className="text-xs">
                      {place.category}
                    </Badge>
                  )}
                  {enrichment && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCrowdLevelColor(enrichment.crowdLevel.level)}`}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      {enrichment.crowdLevel.level} crowds
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  {place.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {place.rating}
                    </div>
                  )}
                  {place.bestTimeToVisit && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {place.bestTimeToVisit}
                    </div>
                  )}
                  {enrichment && (
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      {enrichment.weather.icon} {enrichment.weather.temperature}
                    </div>
                  )}
                </div>

                {/* Quick status indicators */}
                {enrichment && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className={`flex items-center gap-1 ${enrichment.openingHours.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                      {enrichment.openingHours.isOpen ? 
                        <CheckCircle className="h-3 w-3" /> : 
                        <AlertCircle className="h-3 w-3" />
                      }
                      {enrichment.openingHours.isOpen ? 'Open now' : 'Closed'}
                    </div>
                    <div className="text-muted-foreground">
                      Entry: ${enrichment.estimatedCosts.entry}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                <div className="text-sm">Loading enriched information...</div>
              </div>
            ) : enrichment && (
              <div className="space-y-4">
                {/* Description */}
                {place.description && (
                  <p className="text-sm text-muted-foreground">
                    {place.description}
                  </p>
                )}

                <Separator />

                {/* Detailed Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Opening Hours & Status */}
                  <div className="space-y-2">
                    <h6 className="font-medium text-sm">Hours & Status</h6>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Hours:</span>
                        <span>{enrichment.openingHours.hours}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        <span className={enrichment.openingHours.isOpen ? 'text-green-600' : 'text-red-600'}>
                          {enrichment.openingHours.nextChange}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Crowd Level:</span>
                        <span className="capitalize">{enrichment.crowdLevel.level}</span>
                      </div>
                    </div>
                  </div>

                  {/* Costs */}
                  <div className="space-y-2">
                    <h6 className="font-medium text-sm">Estimated Costs</h6>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Entry Fee:</span>
                        <span>${enrichment.estimatedCosts.entry}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Food/Drinks:</span>
                        <span>${enrichment.estimatedCosts.food}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Parking:</span>
                        <span>${enrichment.estimatedCosts.parking}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h6 className="font-medium text-sm mb-2">Amenities</h6>
                  <div className="flex flex-wrap gap-1">
                    {enrichment.amenities.map((amenity, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Accessibility */}
                <div>
                  <h6 className="font-medium text-sm mb-2">Accessibility</h6>
                  <div className="flex items-start gap-2 text-xs">
                    {enrichment.accessibility.wheelchairAccessible ? 
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" /> :
                      <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    }
                    <span>{enrichment.accessibility.notes}</span>
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <h6 className="font-medium text-sm mb-2">Insider Tips</h6>
                  <ul className="space-y-1">
                    {enrichment.tips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => onNavigate(place)}
                    size="sm"
                    className="flex-1"
                  >
                    <Navigation className="h-3 w-3 mr-2" />
                    Navigate Here
                  </Button>
                  <Button 
                    onClick={() => window.open(getExternalMapsUrl(), '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default EnrichedPlaceCard;