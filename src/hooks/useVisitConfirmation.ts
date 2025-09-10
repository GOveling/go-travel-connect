import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getAdaptiveVisitRadius } from '@/utils/adaptiveRadius';
import { useAuth } from '@/hooks/useAuth';

interface VisitConfirmationData {
  savedPlaceId: string;
  distance: number;
  userLat: number;
  userLng: number;
}

interface VisitResult {
  success: boolean;
  visitId?: string;
  placeName?: string;
  category?: string;
  error?: string;
}

export const useVisitConfirmation = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const confirmVisit = async ({
    savedPlaceId,
    distance,
    userLat,
    userLng,
  }: VisitConfirmationData): Promise<VisitResult> => {
    setIsConfirming(true);
    
    try {
      console.log('🎯 Confirming place visit:', {
        savedPlaceId,
        distance,
        coordinates: { lat: userLat, lng: userLng }
      });

      // Get place info to calculate adaptive radius
      const { data: placeData, error: placeError } = await supabase
        .from('saved_places')
        .select('name, category, description')
        .eq('id', savedPlaceId)
        .single();

      if (placeError) {
        console.error('❌ Error fetching place data:', placeError);
        throw placeError;
      }

      // Calculate adaptive radius for this place
      const adaptiveRadius = getAdaptiveVisitRadius(placeData);
      console.log(`📏 Using adaptive radius: ${adaptiveRadius}m for place: ${placeData.name}`);

      // For now, we'll validate the distance client-side with adaptive radius
      // TODO: Update database function to accept adaptive radius parameter
      if (distance > adaptiveRadius) {
        console.warn(`⚠️ Distance ${distance}m exceeds adaptive radius ${adaptiveRadius}m for ${placeData.name}`);
        return {
          success: false,
          error: `Estás a ${Math.round(distance)}m del lugar. Necesitas estar dentro de ${adaptiveRadius}m para confirmar la visita.`,
        };
      }

      // Call the database function to confirm the visit
      const { data, error } = await supabase.rpc('confirm_place_visit', {
        p_saved_place_id: savedPlaceId,
        p_confirmation_distance: distance,
        p_location_lat: userLat,
        p_location_lng: userLng,
      });

      if (error) {
        console.error('❌ Error confirming visit:', error);
        throw error;
      }

      const result = data as unknown as VisitResult;
      
      if (!result.success) {
        console.warn('⚠️ Visit confirmation failed:', result.error);
        return result;
      }

      console.log('✅ Visit confirmed successfully:', result);
      
      // Show success notification
      toast({
        title: "¡Lugar visitado! 🎉",
        description: `${result.placeName} ha sido marcado como visitado.`,
      });

      return result;

    } catch (error) {
      console.error('❌ Failed to confirm visit:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      toast({
        title: "Error al confirmar visita",
        description: `No se pudo marcar el lugar como visitado: ${errorMessage}`,
        variant: "destructive",
      });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsConfirming(false);
    }
  };

  const checkIfPlaceVisited = async (savedPlaceId: string): Promise<boolean> => {
    try {
      if (!user?.id) return false;

      const { data, error } = await supabase.rpc('is_place_visited_by_user', {
        p_saved_place_id: savedPlaceId,
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking if place is visited:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in checkIfPlaceVisited:', error);
      return false;
    }
  };

  const getVisitHistory = async (tripId?: string) => {
    try {
      let query = supabase
        .from('place_visits')
        .select(`
          *,
          saved_places(name, category, image)
        `)
        .order('visited_at', { ascending: false });

      if (tripId) {
        query = query.eq('trip_id', tripId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching visit history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting visit history:', error);
      return [];
    }
  };

  return {
    confirmVisit,
    checkIfPlaceVisited,
    getVisitHistory,
    isConfirming,
  };
};