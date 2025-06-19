
import { extractStartDate, extractEndDate } from "./flightBookingUtils";
import { getAIFlightTimingRecommendation, adjustFlightDateBasedOnAI } from "./aiFlightTimingUtils";

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface MultiCityFlight {
  from: string;
  to: string;
  departDate: string;
  passengers: number;
  class: string;
}

interface TripSelectionResult {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  formData?: FormData;
  multiCityFlights?: MultiCityFlight[];
  aiRecommendation: any;
  optimizedFlights: MultiCityFlight[];
}

export const processTripSelection = (
  selectedTripData: any,
  currentLocation: string
): TripSelectionResult => {
  console.log('🤖 AI Flight Protocol - Processing trip:', selectedTripData);
  
  const destinations = selectedTripData.coordinates || [];
  const tripStartDate = extractStartDate(selectedTripData.dates);
  const tripEndDate = extractEndDate(selectedTripData.dates);
  
  if (destinations.length === 0) {
    throw new Error('No destinations found in selected trip');
  }

  const firstDestination = destinations[0].name;
  
  // Get AI recommendation for the first flight
  const aiRecommendation = getAIFlightTimingRecommendation(
    currentLocation,
    firstDestination,
    tripStartDate
  );

  const optimizedDepartDate = adjustFlightDateBasedOnAI(tripStartDate, aiRecommendation);
  
  if (destinations.length > 1) {
    // Multi-city trip processing
    const optimizedFlights = processMultiCityTrip({
      destinations,
      currentLocation,
      tripStartDate,
      tripEndDate,
      optimizedDepartDate,
      travelers: selectedTripData.travelers || 1
    });

    return {
      tripType: 'multi-city',
      multiCityFlights: optimizedFlights,
      aiRecommendation,
      optimizedFlights
    };
  } else {
    // Single destination trip processing
    const endDate = extractEndDate(selectedTripData.dates);
    const tripType = endDate ? 'round-trip' : 'one-way';
    
    const formData: FormData = {
      from: currentLocation,
      to: firstDestination,
      departDate: optimizedDepartDate,
      returnDate: endDate || '',
      passengers: selectedTripData.travelers || 1,
      class: 'economy'
    };

    return {
      tripType,
      formData,
      aiRecommendation,
      optimizedFlights: []
    };
  }
};

const processMultiCityTrip = ({
  destinations,
  currentLocation,
  tripStartDate,
  tripEndDate,
  optimizedDepartDate,
  travelers
}: {
  destinations: any[];
  currentLocation: string;
  tripStartDate: string;
  tripEndDate: string | null;
  travelers: number;
}): MultiCityFlight[] => {
  const optimizedFlights: MultiCityFlight[] = [];
  
  // First flight: current location to first destination
  optimizedFlights.push({
    from: currentLocation,
    to: destinations[0].name,
    departDate: optimizedDepartDate,
    passengers: travelers,
    class: 'economy'
  });

  // Calculate days per destination
  const totalDays = tripEndDate ? 
    Math.ceil((new Date(tripEndDate).getTime() - new Date(tripStartDate).getTime()) / (1000 * 60 * 60 * 24)) : 
    destinations.length * 3;
  
  const daysPerDestination = Math.max(2, Math.floor(totalDays / destinations.length));

  // Intermediate flights between destinations
  for (let i = 1; i < destinations.length; i++) {
    const fromDest = destinations[i - 1].name;
    const toDest = destinations[i].name;
    
    const intermediateDate = new Date(tripStartDate);
    intermediateDate.setDate(intermediateDate.getDate() + (i * daysPerDestination));
    
    const segmentRecommendation = getAIFlightTimingRecommendation(
      fromDest,
      toDest,
      intermediateDate.toISOString().split('T')[0]
    );
    
    const optimizedSegmentDate = adjustFlightDateBasedOnAI(
      intermediateDate.toISOString().split('T')[0], 
      segmentRecommendation
    );
    
    optimizedFlights.push({
      from: fromDest,
      to: toDest,
      departDate: optimizedSegmentDate,
      passengers: travelers,
      class: 'economy'
    });
  }

  // Add return flight if trip has end date - ALWAYS use the exact end date without AI optimization
  if (tripEndDate) {
    const lastDestination = destinations[destinations.length - 1].name;
    
    optimizedFlights.push({
      from: lastDestination,
      to: currentLocation,
      departDate: tripEndDate, // Use exact end date without AI optimization
      passengers: travelers,
      class: 'economy'
    });

    console.log('🛬 Return flight added with exact end date:', {
      from: lastDestination,
      to: currentLocation,
      date: tripEndDate,
      note: 'Using exact itinerary end date without AI optimization'
    });
  }

  return optimizedFlights;
};
