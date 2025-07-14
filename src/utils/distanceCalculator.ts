// Distance calculation utilities for travel route optimization

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface DistanceMatrix {
  from: Coordinate;
  to: Coordinate;
  distance: number; // kilometers
  travelTime: number; // minutes
  transportType: 'walking' | 'driving' | 'transit';
}

export interface PlaceDistance {
  placeId: string;
  placeName: string;
  coordinate: Coordinate;
  distancesTo: DistanceMatrix[];
}

// Haversine formula to calculate distance between two coordinates
export const calculateHaversineDistance = (coord1: Coordinate, coord2: Coordinate): number => {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

// Estimate travel time based on distance and transport type
export const estimateTravelTime = (
  distance: number, 
  transportType: 'walking' | 'driving' | 'transit' = 'walking'
): number => {
  // Average speeds in km/h
  const speeds = {
    walking: 5,     // 5 km/h
    driving: 30,    // 30 km/h in urban areas
    transit: 20     // 20 km/h average with stops
  };
  
  const timeInHours = distance / speeds[transportType];
  return Math.round(timeInHours * 60); // Convert to minutes
};

// Create distance matrix for all places in a trip
export const createDistanceMatrix = (places: Array<{
  id: string;
  name: string;
  lat: number;
  lng: number;
}>): PlaceDistance[] => {
  if (!places || places.length === 0) return [];
  
  return places.map(place => {
    const coordinate = { lat: place.lat, lng: place.lng };
    
    const distancesTo = places
      .filter(otherPlace => otherPlace.id !== place.id)
      .map(otherPlace => {
        const otherCoordinate = { lat: otherPlace.lat, lng: otherPlace.lng };
        const distance = calculateHaversineDistance(coordinate, otherCoordinate);
        
        // Determine best transport type based on distance
        let transportType: 'walking' | 'driving' | 'transit';
        if (distance <= 1) {
          transportType = 'walking';
        } else if (distance <= 10) {
          transportType = 'transit';
        } else {
          transportType = 'driving';
        }
        
        const travelTime = estimateTravelTime(distance, transportType);
        
        return {
          from: coordinate,
          to: otherCoordinate,
          distance,
          travelTime,
          transportType
        };
      });
    
    return {
      placeId: place.id,
      placeName: place.name,
      coordinate,
      distancesTo
    };
  });
};

// Calculate total distance for a route (ordered list of places)
export const calculateRouteDistance = (route: Coordinate[]): number => {
  if (route.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateHaversineDistance(route[i], route[i + 1]);
  }
  
  return totalDistance;
};

// Calculate total travel time for a route
export const calculateRouteTravelTime = (
  route: Array<{ lat: number; lng: number; estimatedTime?: string }>
): { travelTime: number; visitTime: number; totalTime: number } => {
  if (route.length === 0) return { travelTime: 0, visitTime: 0, totalTime: 0 };
  
  let travelTime = 0;
  let visitTime = 0;
  
  // Calculate travel time between places
  for (let i = 0; i < route.length - 1; i++) {
    const distance = calculateHaversineDistance(
      { lat: route[i].lat, lng: route[i].lng },
      { lat: route[i + 1].lat, lng: route[i + 1].lng }
    );
    travelTime += estimateTravelTime(distance);
  }
  
  // Calculate visit time at each place
  route.forEach(place => {
    if (place.estimatedTime) {
      const timeStr = place.estimatedTime.toLowerCase();
      let minutes = 60; // default 1 hour
      
      if (timeStr.includes('hour')) {
        const hours = parseFloat(timeStr.match(/\d+\.?\d*/)?.[0] || '1');
        minutes = hours * 60;
      } else if (timeStr.includes('min')) {
        minutes = parseFloat(timeStr.match(/\d+/)?.[0] || '60');
      }
      
      visitTime += minutes;
    } else {
      visitTime += 60; // default 1 hour
    }
  });
  
  return {
    travelTime,
    visitTime,
    totalTime: travelTime + visitTime
  };
};

// Find optimal route order using nearest neighbor algorithm
export const optimizeRouteOrder = (places: Array<{
  id: string;
  name: string;
  lat: number;
  lng: number;
  priority?: string;
}>): Array<{ id: string; name: string; lat: number; lng: number; priority?: string }> => {
  if (places.length <= 1) return places;
  
  const unvisited = [...places];
  const route = [];
  
  // Start with highest priority place, or first place if no priorities
  const startIndex = unvisited.findIndex(p => p.priority === 'high') || 0;
  let current = unvisited.splice(startIndex, 1)[0];
  route.push(current);
  
  // Use nearest neighbor to build route
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    
    unvisited.forEach((place, index) => {
      const distance = calculateHaversineDistance(
        { lat: current.lat, lng: current.lng },
        { lat: place.lat, lng: place.lng }
      );
      
      // Bias towards high priority places (reduce effective distance)
      const adjustedDistance = place.priority === 'high' ? distance * 0.7 : distance;
      
      if (adjustedDistance < nearestDistance) {
        nearestDistance = adjustedDistance;
        nearestIndex = index;
      }
    });
    
    current = unvisited.splice(nearestIndex, 1)[0];
    route.push(current);
  }
  
  return route;
};