import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getFormattedDateRange } from "@/utils/dateHelpers";
export const useSupabaseTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTrips = async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch trips where user is owner or collaborator using proper PostgREST syntax
      const { data: tripsData, error: tripsError } = await supabase
        .from("trips")
        .select(
          `
          *,
          trip_coordinates (
            id,
            name,
            lat,
            lng,
            order_index
          ),
          trip_collaborators (
            id,
            user_id,
            role,
            name,
            email,
            avatar
          ),
            saved_places (
              id,
              name,
              category,
              rating,
              image,
              description,
              estimated_time,
              priority,
              destination_name,
              lat,
              lng,
              position_order,
              formatted_address,
              address_json,
              country,
              state,
              region,
              city,
              district,
              neighborhood,
              postal_code,
              street,
              street_number,
              place_source,
              place_reference
            )
        `
        )
        .order("created_at", { ascending: false });

      if (tripsError) {
        console.error("Error fetching trips:", tripsError);
        toast({
          title: "Error loading trips",
          description: tripsError.message,
          variant: "destructive",
        });
        setTrips([]); // Clear trips on error
        return;
      }

      // Transform Supabase data to Trip format
      const transformedTrips: Trip[] =
        tripsData?.map((trip: any) => ({
          id: trip.id, // Keep UUID as string for proper Supabase compatibility
          name: trip.name,
          destination: trip.destination,
          dates: getFormattedDateRange(
            trip.start_date ? new Date(trip.start_date) : undefined,
            trip.end_date ? new Date(trip.end_date) : undefined
          ),
          startDate: trip.start_date ? new Date(trip.start_date) : undefined,
          endDate: trip.end_date ? new Date(trip.end_date) : undefined,
          status: trip.status,
          travelers: trip.travelers || 1,
          image: trip.image || "✈️",
          isGroupTrip: trip.is_group_trip || false,
          user_id: trip.user_id,
          description: trip.description || "",
          budget: trip.budget || "",
          accommodation: trip.accommodation || "",
          transportation: trip.transportation || "",
          coordinates:
            trip.trip_coordinates
              ?.sort(
                (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
              )
              ?.map((coord: any) => ({
                name: coord.name,
                lat: coord.lat || 0,
                lng: coord.lng || 0,
              })) || [],
          collaborators:
            trip.trip_collaborators?.map((collab: any) => ({
              id: collab.id,
              name: collab.name || collab.email || "Unknown",
              email: collab.email || "",
              avatar: collab.avatar || "👤",
              role: collab.role || "editor",
            })) || [],
          savedPlaces:
            trip.saved_places
              ?.sort((a: any, b: any) => (a.position_order || 0) - (b.position_order || 0))
              ?.map((place: any) => ({
                id: place.id,
                name: place.name,
                category: place.category || "attraction",
                rating: place.rating || 4.5,
                image: place.image || "📍",
                description: place.description || "",
                estimatedTime: place.estimated_time || "2-3 hours",
                priority: place.priority || "medium",
                destinationName: place.destination_name || "",
                lat: place.lat || 0,
                lng: place.lng || 0,
                positionOrder: place.position_order || 0,
                // Address hierarchy
                formattedAddress: place.formatted_address || undefined,
                addressJson: place.address_json || undefined,
                country: place.country || undefined,
                state: place.state || undefined,
                region: place.region || undefined,
                city: place.city || undefined,
                district: place.district || undefined,
                neighborhood: place.neighborhood || undefined,
                postalCode: place.postal_code || undefined,
                street: place.street || undefined,
                streetNumber: place.street_number || undefined,
                placeSource: place.place_source || undefined,
                placeReference: place.place_reference || undefined,
              })) || [],
        })) || [];

      setTrips(transformedTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast({
        title: "Error loading trips",
        description: "Failed to load your trips",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new trip
  const createTrip = async (tripData: any) => {
    if (!user) return null;

    try {
      // Create the main trip
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .insert({
          user_id: user.id,
          name: tripData.name || "New Trip",
          destination: tripData.destination || "",
          
          start_date: tripData.startDate ? tripData.startDate.toISOString() : null,
          end_date: tripData.endDate ? tripData.endDate.toISOString() : null,
          status: tripData.status || "planning",
          travelers: tripData.travelers || 1,
          image: tripData.image || "✈️",
          is_group_trip: tripData.isGroupTrip || false,
          description: tripData.description || "",
          budget: tripData.budget || "",
          accommodation: tripData.accommodation || "",
          transportation: tripData.transportation || "",
        })
        .select()
        .single();

      if (tripError) {
        console.error("Error creating trip:", tripError);
        toast({
          title: "Error creating trip",
          description: tripError.message,
          variant: "destructive",
        });
        return null;
      }

      // Create coordinates if provided
      if (tripData.coordinates && tripData.coordinates.length > 0) {
        const coordinatesData = tripData.coordinates.map((coord, index) => ({
          trip_id: trip.id,
          name: coord.name,
          lat: coord.lat,
          lng: coord.lng,
          order_index: index,
        }));

        const { error: coordError } = await supabase
          .from("trip_coordinates")
          .insert(coordinatesData);

        if (coordError) {
          console.error("Error creating coordinates:", coordError);
        }
      }

      // Create saved place if provided
      if (tripData.savedPlace) {
        const savedPlaceData = {
          trip_id: trip.id,
          name: tripData.savedPlace.name,
          category: tripData.savedPlace.category,
          rating: tripData.savedPlace.rating,
          image: tripData.savedPlace.image,
          description: tripData.savedPlace.description,
          estimated_time: tripData.savedPlace.estimated_time,
          priority: tripData.savedPlace.priority,
          destination_name: tripData.savedPlace.destination_name,
          lat: tripData.savedPlace.lat,
          lng: tripData.savedPlace.lng,
        };

        const { error: placeError } = await supabase
          .from("saved_places")
          .insert(savedPlaceData);

        if (placeError) {
          console.error("Error creating saved place:", placeError);
        }
      }

      // Refresh trips list
      await fetchTrips();

      toast({
        title: "Trip created!",
        description: `${tripData.name} has been added to your trips.`,
      });

      return trip;
    } catch (error) {
      console.error("Error creating trip:", error);
      toast({
        title: "Error creating trip",
        description: "Failed to create your trip",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update a trip
  const updateTrip = async (
    tripId: string | number,
    tripData: Partial<Trip>
  ) => {
    if (!user) return false;

    try {
      // Use tripId directly since it's already the UUID string
      const tripUUID = typeof tripId === "string" ? tripId : tripId.toString();

      const { error: tripError } = await supabase
        .from("trips")
        .update({
          name: tripData.name,
          destination: tripData.destination,
          
          start_date: tripData.startDate ? tripData.startDate.toISOString() : null,
          end_date: tripData.endDate ? tripData.endDate.toISOString() : null,
          status: tripData.status,
          travelers: tripData.travelers,
          image: tripData.image,
          is_group_trip: tripData.isGroupTrip,
          description: tripData.description,
          budget: tripData.budget,
          accommodation: tripData.accommodation,
          transportation: tripData.transportation,
        })
        .eq("id", tripUUID);

      if (tripError) {
        console.error("Error updating trip:", tripError);
        toast({
          title: "Error updating trip",
          description: tripError.message,
          variant: "destructive",
        });
        return false;
      }

      // Update coordinates if provided
      if (tripData.coordinates) {
        // Delete existing coordinates
        await supabase
          .from("trip_coordinates")
          .delete()
          .eq("trip_id", tripUUID);

        // Insert new coordinates
        if (tripData.coordinates.length > 0) {
          const coordinatesData = tripData.coordinates.map((coord, index) => ({
            trip_id: tripUUID,
            name: coord.name,
            lat: coord.lat,
            lng: coord.lng,
            order_index: index,
          }));

          await supabase.from("trip_coordinates").insert(coordinatesData);
        }
      }

      // Refresh trips list
      await fetchTrips();

      toast({
        title: "Trip updated!",
        description: `${tripData.name} has been updated.`,
      });

      return true;
    } catch (error) {
      console.error("Error updating trip:", error);
      toast({
        title: "Error updating trip",
        description: "Failed to update your trip",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a trip (or hide it if not owner)
  const deleteTrip = async (tripId: string | number) => {
    if (!user) return false;

    try {
      // Use tripId directly as UUID
      const tripUUID = typeof tripId === "string" ? tripId : tripId.toString();

      // First check if user is the owner
      const { data: tripData } = await supabase
        .from("trips")
        .select("user_id")
        .eq("id", tripUUID)
        .single();

      if (tripData?.user_id === user.id) {
        // User is owner - actually delete the trip
        const { error } = await supabase
          .from("trips")
          .delete()
          .eq("id", tripUUID);

        if (error) {
          console.error("Error deleting trip:", error);
          toast({
            title: "Error deleting trip",
            description: error.message,
            variant: "destructive",
          });
          return false;
        }

        toast({
          title: "Trip deleted",
          description: "Your trip has been removed.",
        });
      } else {
        // User is not owner - hide the trip from their view
        const { error } = await supabase
          .from("trips_hidden_by_user")
          .insert({
            user_id: user.id,
            trip_id: tripUUID,
          });

        if (error) {
          console.error("Error hiding trip:", error);
          toast({
            title: "Error removing trip",
            description: error.message,
            variant: "destructive",
          });
          return false;
        }

        toast({
          title: "Trip removed",
          description: "The trip has been removed from your list.",
        });
      }

      // Refresh trips list
      await fetchTrips();
      return true;
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Error removing trip",
        description: "Failed to remove your trip",
        variant: "destructive",
      });
      return false;
    }
  };

  // Load trips when user changes
  useEffect(() => {
    fetchTrips();
  }, [user]);

  // Listen for invitation acceptance events and collaborator removal with realtime
  useEffect(() => {
    if (!user?.id) return;

    const handleInvitationAccepted = () => {
      console.log('Trip invitation accepted, refreshing trips...');
      fetchTrips();
    };

    const handleCollaboratorRemoved = () => {
      console.log('Collaborator removed, refreshing trips...');
      fetchTrips();
    };

    window.addEventListener('tripInvitationAccepted', handleInvitationAccepted);
    window.addEventListener('collaboratorRemoved', handleCollaboratorRemoved);

    // Create a unique channel name to avoid conflicts
    const channelName = `trip_collaborators_${user.id}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set up realtime subscription for trip_collaborators changes
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'trip_collaborators',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Collaborator deleted realtime:', payload);
          // Refresh trips immediately when this user is removed as collaborator
          fetchTrips();
        }
      );

    // Subscribe only after setting up all listeners
    channel.subscribe();
    
    return () => {
      window.removeEventListener('tripInvitationAccepted', handleInvitationAccepted);
      window.removeEventListener('collaboratorRemoved', handleCollaboratorRemoved);
      // Unsubscribe and remove channel properly
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    trips,
    loading,
    createTrip,
    updateTrip,
    deleteTrip,
    refetchTrips: fetchTrips,
  };
};
