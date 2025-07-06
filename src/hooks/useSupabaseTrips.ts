
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trip } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch trips from Supabase
  const fetchTrips = async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch trips with their coordinates and collaborators
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`
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
            lng
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tripsError) {
        console.error('Error fetching trips:', tripsError);
        toast({
          title: "Error loading trips",
          description: tripsError.message,
          variant: "destructive",
        });
        return;
      }

      // Transform Supabase data to Trip format
      const transformedTrips: Trip[] = tripsData?.map((trip: any) => ({
        id: parseInt(trip.id), // Convert UUID to number for compatibility
        name: trip.name,
        destination: trip.destination,
        dates: trip.dates,
        status: trip.status,
        travelers: trip.travelers || 1,
        image: trip.image || "✈️",
        isGroupTrip: trip.is_group_trip || false,
        description: trip.description || "",
        budget: trip.budget || "",
        accommodation: trip.accommodation || "",
        transportation: trip.transportation || "",
        coordinates: trip.trip_coordinates
          ?.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
          ?.map((coord: any) => ({
            name: coord.name,
            lat: coord.lat || 0,
            lng: coord.lng || 0
          })) || [],
        collaborators: trip.trip_collaborators?.map((collab: any) => ({
          id: collab.id,
          name: collab.name || collab.email || 'Unknown',
          email: collab.email || '',
          avatar: collab.avatar || '👤',
          role: collab.role || 'editor'
        })) || [],
        savedPlaces: trip.saved_places?.map((place: any) => ({
          id: place.id,
          name: place.name,
          category: place.category || 'attraction',
          rating: place.rating || 4.5,
          image: place.image || "📍",
          description: place.description || "",
          estimatedTime: place.estimated_time || "2-3 hours",
          priority: place.priority || "medium",
          destinationName: place.destination_name || "",
          lat: place.lat || 0,
          lng: place.lng || 0
        })) || []
      })) || [];

      setTrips(transformedTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
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
  const createTrip = async (tripData: Partial<Trip>) => {
    if (!user) return null;

    try {
      // Create the main trip
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          name: tripData.name || 'New Trip',
          destination: tripData.destination || '',
          dates: tripData.dates || 'Dates TBD',
          status: tripData.status || 'planning',
          travelers: tripData.travelers || 1,
          image: tripData.image || '✈️',
          is_group_trip: tripData.isGroupTrip || false,
          description: tripData.description || '',
          budget: tripData.budget || '',
          accommodation: tripData.accommodation || '',
          transportation: tripData.transportation || ''
        })
        .select()
        .single();

      if (tripError) {
        console.error('Error creating trip:', tripError);
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
          order_index: index
        }));

        const { error: coordError } = await supabase
          .from('trip_coordinates')
          .insert(coordinatesData);

        if (coordError) {
          console.error('Error creating coordinates:', coordError);
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
      console.error('Error creating trip:', error);
      toast({
        title: "Error creating trip",
        description: "Failed to create your trip",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update a trip
  const updateTrip = async (tripId: number, tripData: Partial<Trip>) => {
    if (!user) return false;

    try {
      // Convert numeric ID to string for Supabase UUID
      const tripUUID = trips.find(t => t.id === tripId)?.id?.toString();
      
      const { error: tripError } = await supabase
        .from('trips')
        .update({
          name: tripData.name,
          destination: tripData.destination,
          dates: tripData.dates,
          status: tripData.status,
          travelers: tripData.travelers,
          image: tripData.image,
          is_group_trip: tripData.isGroupTrip,
          description: tripData.description,
          budget: tripData.budget,
          accommodation: tripData.accommodation,
          transportation: tripData.transportation
        })
        .eq('id', tripUUID);

      if (tripError) {
        console.error('Error updating trip:', tripError);
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
          .from('trip_coordinates')
          .delete()
          .eq('trip_id', tripUUID);

        // Insert new coordinates
        if (tripData.coordinates.length > 0) {
          const coordinatesData = tripData.coordinates.map((coord, index) => ({
            trip_id: tripUUID,
            name: coord.name,
            lat: coord.lat,
            lng: coord.lng,
            order_index: index
          }));

          await supabase
            .from('trip_coordinates')
            .insert(coordinatesData);
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
      console.error('Error updating trip:', error);
      toast({
        title: "Error updating trip",
        description: "Failed to update your trip",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a trip
  const deleteTrip = async (tripId: number) => {
    if (!user) return false;

    try {
      // Find the trip to delete
      const tripToDelete = trips.find(t => t.id === tripId);
      if (!tripToDelete) {
        toast({
          title: "Error",
          description: "Trip not found",
          variant: "destructive",
        });
        return false;
      }

      // Delete the trip using user_id and trip properties to find the exact match
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('user_id', user.id)
        .eq('name', tripToDelete.name)
        .eq('destination', tripToDelete.destination)
        .eq('dates', tripToDelete.dates);

      if (error) {
        console.error('Error deleting trip:', error);
        toast({
          title: "Error deleting trip",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      // Refresh trips list
      await fetchTrips();

      toast({
        title: "Trip deleted",
        description: "Your trip has been removed.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error deleting trip",
        description: "Failed to delete your trip",
        variant: "destructive",
      });
      return false;
    }
  };

  // Load trips when user changes
  useEffect(() => {
    fetchTrips();
  }, [user]);

  return {
    trips,
    loading,
    createTrip,
    updateTrip,
    deleteTrip,
    refetchTrips: fetchTrips
  };
};
