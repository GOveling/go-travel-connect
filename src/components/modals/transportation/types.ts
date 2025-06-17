
import { Trip } from "@/types";

export interface TransportationRecommendation {
  destination: string;
  date: string;
  transportType: string;
  route: string;
  estimatedDuration: string;
  estimatedCost: string;
  aiOptimized: boolean;
  reason: string;
  relatedPlaces: string[];
  destinationIndex: number;
  priority: 'high' | 'medium' | 'low';
  bookingRequired: boolean;
  transportCategory: 'airport-arrival' | 'inter-destination' | 'local-transport' | 'airport-departure' | 'home-return';
}

export interface AITransportationPlan {
  tripId: number;
  tripName: string;
  totalDestinations: number;
  recommendations: TransportationRecommendation[];
  aiConfidence: 'high' | 'medium' | 'low';
  optimizationNotes: string[];
  totalEstimatedCost: string;
  fullJourneyMap: {
    airportArrivals: number;
    interDestinationTransports: number;
    localTransports: number;
    airportDepartures: number;
    homeReturn: boolean;
  };
}

export interface TransportDetails {
  duration: string;
  cost: string;
  route: string;
  bookingRequired: boolean;
}
