
import { Trip, SavedPlace } from "@/types";
import { TransportationRecommendation } from "./types";
import { getTransportDetails, formatDateForInput } from "./transportUtils";

// Generate airport arrival transport for first destination
export const generateAirportArrivalTransport = (
  destination: any, 
  places: SavedPlace[], 
  startDate: Date, 
  index: number
): TransportationRecommendation => {
  const airportTransportType = places.length > 3 ? 'airport-shuttle' : 'taxi';
  const details = getTransportDetails(airportTransportType, `Aeropuerto ${destination.name}`, destination.name);
  
  return {
    destination: destination.name,
    date: formatDateForInput(startDate),
    transportType: airportTransportType,
    route: `Aeropuerto ${destination.name} → Centro ciudad`,
    estimatedDuration: details.duration,
    estimatedCost: details.cost,
    aiOptimized: true,
    reason: `${airportTransportType} recomendado desde aeropuerto basado en ${places.length} lugares guardados`,
    relatedPlaces: places.slice(0, 3).map(place => place.name),
    destinationIndex: index,
    priority: 'high' as const,
    bookingRequired: details.bookingRequired,
    transportCategory: 'airport-arrival' as const
  };
};

// Generate airport departure transport for last destination
export const generateAirportDepartureTransport = (
  destination: any, 
  places: SavedPlace[], 
  endDate: Date, 
  index: number
): TransportationRecommendation => {
  const airportTransportType = places.length > 3 ? 'airport-shuttle' : 'taxi';
  const details = getTransportDetails(airportTransportType, destination.name, `Aeropuerto ${destination.name}`);
  
  return {
    destination: destination.name,
    date: formatDateForInput(endDate),
    transportType: airportTransportType,
    route: `Centro ciudad → Aeropuerto ${destination.name}`,
    estimatedDuration: details.duration,
    estimatedCost: details.cost,
    aiOptimized: true,
    reason: `${airportTransportType} para salida desde aeropuerto`,
    relatedPlaces: places.slice(0, 3).map(place => place.name),
    destinationIndex: index,
    priority: 'high' as const,
    bookingRequired: details.bookingRequired,
    transportCategory: 'airport-departure' as const
  };
};

// Generate home return transport option
export const generateHomeReturnTransport = (
  trip: Trip
): TransportationRecommendation => {
  return {
    destination: 'Casa',
    date: formatDateForInput(new Date()), // Current date as placeholder
    transportType: 'taxi',
    route: 'Aeropuerto → Casa',
    estimatedDuration: '45-90 min',
    estimatedCost: '$30-80',
    aiOptimized: true,
    reason: 'Transporte opcional para retorno a casa desde aeropuerto',
    relatedPlaces: [],
    destinationIndex: -1,
    priority: 'medium' as const,
    bookingRequired: false,
    transportCategory: 'home-return' as const
  };
};
