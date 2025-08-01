import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SavedPlace } from '@/types';
import { toast } from 'sonner';

export const usePlaceReordering = () => {
  const [isReordering, setIsReordering] = useState(false);

  const updatePlacePosition = async (placeId: string, newPosition: number) => {
    try {
      const { error } = await supabase
        .from('saved_places')
        .update({ position_order: newPosition })
        .eq('id', placeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating place position:', error);
      toast.error('Error al actualizar la posición del lugar');
      throw error;
    }
  };

  const reorderPlaces = async (places: SavedPlace[], fromIndex: number, toIndex: number) => {
    setIsReordering(true);
    
    try {
      // Create a copy of the places array and reorder it
      const reorderedPlaces = [...places];
      const [movedPlace] = reorderedPlaces.splice(fromIndex, 1);
      reorderedPlaces.splice(toIndex, 0, movedPlace);

      // Update positions in batch
      const updates = reorderedPlaces.map((place, index) => 
        updatePlacePosition(place.id, index + 1)
      );

      await Promise.all(updates);
      
      toast.success('Orden actualizado correctamente');
      return reorderedPlaces;
    } catch (error) {
      console.error('Error reordering places:', error);
      toast.error('Error al reordenar los lugares');
      return places; // Return original order on error
    } finally {
      setIsReordering(false);
    }
  };

  return {
    isReordering,
    reorderPlaces,
    updatePlacePosition
  };
};