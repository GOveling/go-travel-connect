import { useState, useEffect } from "react";
import { useSupabaseTrips } from "./useSupabaseTrips";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { Trip, SavedPlace } from "@/types";

interface Place {
  name: string;
  location: string;
  rating?: number;
  image?: string;
  category: string;
  description?: string;
  lat?: number;
  lng?: number;
}

export const useAddToTrip = () => {
  const { trips, loading: tripsLoading, refetchTrips } = useSupabaseTrips();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isAddingToTrip, setIsAddingToTrip] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter trips based on search query
  const filteredTrips = trips.filter((trip) => {
    const nameMatch = trip.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Handle destination as JSON array of countries
    let destinationMatch = false;
    if (Array.isArray(trip.destination)) {
      destinationMatch = trip.destination.some(
        (country) =>
          country &&
          typeof country === "string" &&
          country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return nameMatch || destinationMatch;
  });

  // Categorize trips by relevance to the selected place
  const categorizeTrips = (place: Place) => {
    if (!place?.location) return { matching: [], other: filteredTrips };

    const placeLocation = place.location.toLowerCase();

    const matching = filteredTrips.filter((trip) => {
      // Handle destination as JSON array of countries
      let destinationMatch = false;
      if (Array.isArray(trip.destination)) {
        destinationMatch = trip.destination.some(
          (country) =>
            country &&
            typeof country === "string" &&
            country.toLowerCase().includes(placeLocation)
        );
      }

      const coordinatesMatch = trip.coordinates?.some((coord) =>
        coord.name.toLowerCase().includes(placeLocation)
      );

      return destinationMatch || coordinatesMatch;
    });

    const other = filteredTrips.filter((trip) => !matching.includes(trip));

    return { matching, other };
  };

  // Add place to existing trip
  const addPlaceToTrip = async (
    tripId: string,
    place: Place
  ): Promise<boolean> => {
    console.log("=== ADD PLACE TO TRIP DEBUG ===");
    console.log("User:", user?.id);
    console.log("TripId:", tripId);
    console.log("Place:", place);
    console.log(
      "Available trips:",
      trips.map((t) => ({ id: t.id, name: t.name }))
    );
    console.log(
      "Filtered trips:",
      filteredTrips.map((t) => ({ id: t.id, name: t.name }))
    );

    if (!user || !place) {
      console.log("Missing user or place");
      return false;
    }

    try {
      setIsAddingToTrip(true);

      // Find the trip from ALL trips, not just filtered ones
      const selectedTrip = trips.find((t) => t.id === tripId);
      console.log("Selected trip found:", selectedTrip);

      if (!selectedTrip) {
        toast({
          title: "Error",
          description: "Trip not found",
          variant: "destructive",
        });
        return false;
      }

      // Check if place already exists in this trip (based on coordinates, not just name)
      const existingPlace = selectedTrip.savedPlaces?.find((p) => {
        // If both places have coordinates, use them for comparison
        if (place.lat && place.lng && p.lat && p.lng) {
          const latDiff = Math.abs(p.lat - place.lat);
          const lngDiff = Math.abs(p.lng - place.lng);
          // Consider same location if within ~10 meters (approximately 0.0001 degrees)
          return latDiff < 0.0001 && lngDiff < 0.0001;
        }
        // Fallback to name + location comparison if no coordinates
        return (
          p.name.toLowerCase() === place.name.toLowerCase() &&
          p.destinationName?.toLowerCase() === place.location?.toLowerCase()
        );
      });

      if (existingPlace) {
        toast({
          title: "Already Added",
          description: `${place.name} is already in your trip "${selectedTrip.name}"`,
          variant: "destructive",
        });
        return false;
      }

      // Use trip ID directly since it's already a string UUID
      const tripUUID = selectedTrip.id;

      // Create saved place data
      const savedPlaceData = {
        trip_id: tripUUID,
        name: place.name,
        category: place.category,
        rating: place.rating || null,
        image: place.image || "📍",
        description: place.description || "",
        estimated_time: getEstimatedTime(place.category),
        priority: "medium",
        destination_name: place.location,
        lat: place.lat || null,
        lng: place.lng || null,
      };

      console.log("Attempting to insert saved place data:", savedPlaceData);

      const { error } = await supabase
        .from("saved_places")
        .insert(savedPlaceData);

      if (error) {
        console.error("Error adding place to trip:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      console.log("Place successfully added to trip!");

      // Refresh trips data
      await refetchTrips();

      toast({
        title: "Added to Trip!",
        description: `${place.name} has been added to "${selectedTrip.name}"`,
      });

      return true;
    } catch (error) {
      console.error("Error adding place to trip:", error);
      toast({
        title: "Error",
        description: "Failed to add place to trip",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAddingToTrip(false);
    }
  };

  // Get estimated time based on category
  const getEstimatedTime = (category: string): string => {
    const cat = category.toLowerCase();
    if (cat.includes("tourist") || cat.includes("attraction"))
      return "2-3 hours";
    if (cat.includes("park")) return "1-2 hours";
    if (cat.includes("nature")) return "3-4 hours";
    if (cat.includes("museum")) return "5-6 hours";
    if (cat.includes("gallery")) return "4-5 hours";
    if (cat.includes("beach") || cat.includes("lake")) return "4-5 hours";
    if (cat.includes("cafe") || cat.includes("restaurant"))
      return "45-90 minutes";
    if (cat.includes("hotel") || cat.includes("accommodation"))
      return "Check-in experience";
    return "1-2 hours";
  };

  return {
    trips: filteredTrips,
    loading: tripsLoading,
    isAddingToTrip,
    searchQuery,
    setSearchQuery,
    categorizeTrips,
    addPlaceToTrip,
    getEstimatedTime,
  };
};
