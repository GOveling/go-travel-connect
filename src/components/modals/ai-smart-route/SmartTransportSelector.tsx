import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Car, Bus, Plane, Train, Bike, Clock, Wallet, Leaf, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
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
  const baseOptions: TransportOption[] = [{
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
  }, {
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
  }, {
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
  }, {
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
  }];

  // Add intercity options for multi-destination trips
  if (analysis.isMultiDestination && maxDistance > 50) {
    baseOptions.push({
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
    }, {
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
    });
  }
  return baseOptions;
};
const getEnvironmentalColor = (level: string) => {
  switch (level) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
const getComfortColor = (level: string) => {
  switch (level) {
    case 'low':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'high':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};
const SmartTransportSelector: React.FC<SmartTransportSelectorProps> = ({
  analysis,
  currentMode,
  onModeChange,
  maxDistance
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
  return;
};
export default SmartTransportSelector;