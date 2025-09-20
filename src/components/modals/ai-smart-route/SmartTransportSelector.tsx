import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Car, 
  Bus, 
  Plane,
  Train,
  Bike,
  Clock,
  Wallet,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';
import type { MultiDestinationAnalysis } from '@/utils/multiDestinationUtils';

interface TransportOption {
  mode: 'walk' | 'drive' | 'transit' | 'bike' | 'flight' | 'train';
  name: string;
  icon: React.ReactNode;
  duration: string;
  cost: number;
  environmental: 'low' | 'medium' | 'high';
  comfort: 'low' | 'medium' | 'high';
  availability: 'always' | 'limited' | 'seasonal';
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  isRecommended?: boolean;
  isIntercity?: boolean;
}

interface SmartTransportSelectorProps {
  analysis: MultiDestinationAnalysis;
  currentMode: string;
  onModeChange: (mode: string) => void;
  maxDistance: number;
}

const generateTransportOptions = (analysis: MultiDestinationAnalysis, maxDistance: number): TransportOption[] => {
  const baseOptions: TransportOption[] = [
    {
      mode: 'walk',
      name: 'Walking',
      icon: <MapPin className="h-5 w-5" />,
      duration: `${Math.round(maxDistance * 12)} min`,
      cost: 0,
      environmental: 'low',
      comfort: 'low',
      availability: 'always',
      description: 'Perfect for short distances and city exploration',
      pros: ['Free', 'Healthy exercise', 'Flexible stops', 'No scheduling'],
      cons: ['Time consuming', 'Weather dependent', 'Limited distance'],
      bestFor: ['City centers', 'Short distances', 'Sightseeing'],
      isRecommended: maxDistance < 2
    },
    {
      mode: 'bike',
      name: 'Bicycle',
      icon: <Bike className="h-5 w-5" />,
      duration: `${Math.round(maxDistance * 4)} min`,
      cost: 5,
      environmental: 'low',
      comfort: 'medium',
      availability: 'limited',
      description: 'Eco-friendly and efficient for medium distances',
      pros: ['Eco-friendly', 'Faster than walking', 'Good exercise', 'Flexible routing'],
      cons: ['Weather dependent', 'Need bike access', 'Limited storage'],
      bestFor: ['Flat terrain', 'Good weather', 'Active travelers'],
      isRecommended: maxDistance >= 2 && maxDistance < 10
    },
    {
      mode: 'transit',
      name: 'Public Transit',
      icon: <Bus className="h-5 w-5" />,
      duration: `${Math.round(maxDistance * 3)} min`,
      cost: 15,
      environmental: 'low',
      comfort: 'medium',
      availability: 'limited',
      description: 'Cost-effective for urban areas with good coverage',
      pros: ['Affordable', 'No parking needed', 'Local experience', 'Eco-friendly'],
      cons: ['Fixed schedules', 'Can be crowded', 'Route limitations'],
      bestFor: ['City travel', 'Budget conscious', 'Rush hour avoidance'],
      isRecommended: maxDistance >= 5 && maxDistance < 50
    },
    {
      mode: 'drive',
      name: 'Car/Taxi',
      icon: <Car className="h-5 w-5" />,
      duration: `${Math.round(maxDistance * 1.5)} min`,
      cost: maxDistance * 2,
      environmental: 'high',
      comfort: 'high',
      availability: 'always',
      description: 'Maximum flexibility and comfort for any distance',
      pros: ['Door-to-door', 'Luggage friendly', 'Weather protected', 'Flexible timing'],
      cons: ['Expensive', 'Parking challenges', 'Traffic dependent', 'Environmental impact'],
      bestFor: ['Comfort priority', 'Heavy luggage', 'Time sensitive'],
      isRecommended: maxDistance >= 10 && maxDistance < 500
    }
  ];

  // Add intercity options for multi-destination trips
  if (analysis.isMultiDestination && maxDistance > 50) {
    baseOptions.push(
      {
        mode: 'train',
        name: 'Train',
        icon: <Train className="h-5 w-5" />,
        duration: `${Math.round(maxDistance * 0.8)} min`,
        cost: maxDistance * 0.5,
        environmental: 'low',
        comfort: 'high',
        availability: 'limited',
        description: 'Comfortable intercity travel with scenic views',
        pros: ['Comfortable', 'Scenic routes', 'City center to center', 'Eco-friendly'],
        cons: ['Limited routes', 'Fixed schedules', 'May need booking'],
        bestFor: ['Long distances', 'Scenic routes', 'Comfort seekers'],
        isIntercity: true,
        isRecommended: maxDistance >= 100 && maxDistance < 800
      },
      {
        mode: 'flight',
        name: 'Flight',
        icon: <Plane className="h-5 w-5" />,
        duration: `${Math.round(maxDistance * 0.2)} min`,
        cost: Math.max(150, maxDistance * 0.8),
        environmental: 'high',
        comfort: 'medium',
        availability: 'limited',
        description: 'Fastest option for long distances between countries',
        pros: ['Very fast', 'Long distance capable', 'Frequent schedules'],
        cons: ['Expensive', 'Airport time', 'Environmental impact', 'Booking required'],
        bestFor: ['International travel', 'Very long distances', 'Time critical'],
        isIntercity: true,
        isRecommended: maxDistance >= 800
      }
    );
  }

  return baseOptions;
};

const getEnvironmentalColor = (level: string) => {
  switch (level) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getComfortColor = (level: string) => {
  switch (level) {
    case 'low': return 'text-red-600';
    case 'medium': return 'text-yellow-600';
    case 'high': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

const SmartTransportSelector: React.FC<SmartTransportSelectorProps> = ({
  analysis,
  currentMode,
  onModeChange,
  maxDistance: analysis.maxDistanceKm
}) => {
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<TransportOption | null>(null);

  useEffect(() => {
    const options = generateTransportOptions(analysis, maxDistance);
    setTransportOptions(options);
    
    const current = options.find(opt => opt.mode === currentMode);
    setSelectedOption(current || options[0]);
  }, [analysis, maxDistance, currentMode]);

  const handleModeSelect = (option: TransportOption) => {
    setSelectedOption(option);
    onModeChange(option.mode);
  };

  const recommendedOption = transportOptions.find(opt => opt.isRecommended);

  return (
    <div className="space-y-4">
      {/* Header with recommendation */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-blue-600" />
            Smart Transport Selector
          </CardTitle>
          <div className="text-sm text-blue-700">
            {analysis.isMultiDestination ? (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Multi-destination trip detected ({analysis.maxDistance.toFixed(1)}km max distance)
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Single destination trip ({maxDistance.toFixed(1)}km total distance)
              </div>
            )}
          </div>
        </CardHeader>
        {recommendedOption && (
          <CardContent className="pt-0">
            <div className="bg-white p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-600 text-white">Recommended</Badge>
                <span className="font-medium">{recommendedOption.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {recommendedOption.description}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Transport Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {transportOptions.map((option) => (
          <Card 
            key={option.mode}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedOption?.mode === option.mode 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-muted/30'
            }`}
            onClick={() => handleModeSelect(option)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedOption?.mode === option.mode ? 'bg-blue-600 text-white' : 'bg-muted'
                }`}>
                  {option.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{option.name}</h4>
                    {option.isRecommended && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                        Best
                      </Badge>
                    )}
                    {option.isIntercity && (
                      <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
                        Intercity
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{option.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wallet className="h-3 w-3" />
                      <span>${option.cost.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Leaf className={`h-3 w-3 ${getEnvironmentalColor(option.environmental).split(' ')[0]}`} />
                      <span className="capitalize">{option.environmental}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {option.description}
                  </p>
                  
                  {/* Quick pros/cons preview */}
                  <div className="text-xs">
                    <div className="text-green-600 mb-1">
                      ✓ {option.pros[0]}
                    </div>
                    <div className="text-red-600">
                      ✗ {option.cons[0]}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed view of selected option */}
      {selectedOption && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.name} - Detailed View
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">{selectedOption.duration}</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">${selectedOption.cost.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Est. Cost</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${getComfortColor(selectedOption.comfort)}`}>
                  {selectedOption.comfort.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground">Comfort</div>
              </div>
              <div className="text-center">
                <Badge className={getEnvironmentalColor(selectedOption.environmental)}>
                  {selectedOption.environmental} impact
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-sm mb-2 text-green-700">Advantages</h5>
                <ul className="space-y-1">
                  {selectedOption.pros.map((pro, idx) => (
                    <li key={idx} className="text-xs flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-sm mb-2 text-red-700">Considerations</h5>
                <ul className="space-y-1">
                  {selectedOption.cons.map((con, idx) => (
                    <li key={idx} className="text-xs flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Best for */}
            <div>
              <h5 className="font-medium text-sm mb-2">Best for:</h5>
              <div className="flex flex-wrap gap-1">
                {selectedOption.bestFor.map((item, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartTransportSelector;