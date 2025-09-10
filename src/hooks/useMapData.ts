import { useState, useMemo } from "react";
import {
  createDistanceMatrix,
  calculateRouteTravelTime,
  optimizeRouteOrder,
  type PlaceDistance,
} from "@/utils/distanceCalculator";
import { useAuth } from "@/hooks/useAuth";

interface MapFilter {
  status: string[];
  isGroupTrip: boolean | null;
  dateRange: "all" | "upcoming" | "thisYear";
  selectedTripId: string | null;
}

export const useMapData = (trips: any[]) => {
  const { user } = useAuth();
  
  const [filters, setFilters] = useState<MapFilter>({
    status: ["upcoming", "planning", "traveling", "completed"],
    isGroupTrip: null,
    dateRange: "all",
    selectedTripId: null,
  });

  // Filter trips based on current filters
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // If a specific trip is selected, only show that trip
      if (filters.selectedTripId && trip.id !== filters.selectedTripId) {
        return false;
      }

      // Status filter
      if (!filters.status.includes(trip.status)) return false;

      // Group trip filter
      if (
        filters.isGroupTrip !== null &&
        trip.isGroupTrip !== filters.isGroupTrip
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        const now = new Date();
        const currentYear = now.getFullYear();

        if (filters.dateRange === "upcoming") {
          // Only show trips that haven't started yet
          if (trip.status !== "upcoming" && trip.status !== "planning")
            return false;
        } else if (filters.dateRange === "thisYear") {
          // Only show trips from this year
          const tripYear = new Date(trip.dates.split(" - ")[0]).getFullYear();
          if (tripYear !== currentYear) return false;
        }
      }

      return true;
    });
  }, [trips, filters]);

  // Get all unique coordinates from filtered trips, including saved places
  const allCoordinates = useMemo(() => {
    const coords: Array<{
      lat: number;
      lng: number;
      trip: any;
      location: any;
      type: "destination" | "savedPlace";
    }> = [];

    filteredTrips.forEach((trip) => {
      // Add trip destinations
      trip.coordinates?.forEach((coord: any) => {
        coords.push({
          lat: coord.lat,
          lng: coord.lng,
          trip,
          location: coord,
          type: "destination",
        });
      });

      // Add saved places (visited status will be determined dynamically per user)
      trip.savedPlaces?.forEach((place: any) => {
        if (place.lat && place.lng) {
          coords.push({
            lat: place.lat,
            lng: place.lng,
            trip,
            location: { ...place, visited: false }, // Remove global visited status
            type: "savedPlace",
          });
        }
      });
    });

    return coords;
  }, [filteredTrips]);

  // Calculate map center
  const mapCenter = useMemo((): [number, number] => {
    if (allCoordinates.length === 0) return [40.7128, -74.006]; // Default to NYC

    const sumLat = allCoordinates.reduce((sum, coord) => sum + coord.lat, 0);
    const sumLng = allCoordinates.reduce((sum, coord) => sum + coord.lng, 0);

    return [sumLat / allCoordinates.length, sumLng / allCoordinates.length];
  }, [allCoordinates]);

  // Statistics
  const stats = useMemo(() => {
    const totalSavedPlaces = filteredTrips.reduce(
      (total, trip) => total + (trip.savedPlaces?.length || 0),
      0
    );

    return {
      totalTrips: filteredTrips.length,
      upcomingTrips: filteredTrips.filter((t) => t.status === "upcoming")
        .length,
      planningTrips: filteredTrips.filter((t) => t.status === "planning")
        .length,
      travelingTrips: filteredTrips.filter((t) => t.status === "traveling")
        .length,
      completedTrips: filteredTrips.filter((t) => t.status === "completed")
        .length,
      groupTrips: filteredTrips.filter((t) => t.isGroupTrip).length,
      totalDestinations: [
        ...new Set(
          filteredTrips.flatMap((trip) =>
            Array.isArray(trip.destination) ? trip.destination : []
          )
        ),
      ].filter(Boolean).length,
      totalSavedPlaces,
      countries: [
        ...new Set(
          filteredTrips.flatMap(
            (trip) => trip.coordinates?.map((coord: any) => coord.country) || []
          )
        ),
      ].filter(Boolean).length,
    };
  }, [filteredTrips, allCoordinates]);

  // Update filters
  const updateFilters = (newFilters: Partial<MapFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: ["upcoming", "planning", "traveling", "completed"],
      isGroupTrip: null,
      dateRange: "all",
      selectedTripId: null,
    });
  };

  // Select specific trip
  const selectTrip = (tripId: string | null) => {
    setFilters((prev) => ({ ...prev, selectedTripId: tripId }));
  };

  // Calculate distance matrix for a specific trip
  const calculateTripDistances = (trip: any): PlaceDistance[] => {
    if (!trip || !trip.savedPlaces) return [];

    const places = trip.savedPlaces
      .filter(
        (place: any) =>
          place.lat && place.lng && place.lat !== 0 && place.lng !== 0
      )
      .map((place: any) => ({
        id: place.id,
        name: place.name,
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lng),
      }));

    return createDistanceMatrix(places);
  };

  // Calculate travel times and optimize route for a trip
  const calculateOptimizedRoute = (trip: any) => {
    if (!trip || !trip.savedPlaces) return null;

    const places = trip.savedPlaces
      .filter(
        (place: any) =>
          place.lat && place.lng && place.lat !== 0 && place.lng !== 0
      )
      .map((place: any) => ({
        id: place.id,
        name: place.name,
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lng),
        priority: place.priority,
        estimatedTime: place.estimatedTime,
      }));

    if (places.length === 0) return null;

    const optimizedOrder = optimizeRouteOrder(places);
    const travelTimes = calculateRouteTravelTime(optimizedOrder);

    return {
      places: optimizedOrder,
      ...travelTimes,
      distanceMatrix: createDistanceMatrix(places),
    };
  };

  return {
    filteredTrips,
    allCoordinates,
    mapCenter,
    filters,
    stats,
    updateFilters,
    toggleStatusFilter,
    resetFilters,
    selectTrip,
    calculateTripDistances,
    calculateOptimizedRoute,
  };
};
