import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SavedPlaceCard } from '../places/SavedPlaceCard';
import { Loader } from '@/components/ui/loader';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export const TripSavedPlaces = ({ 
  places = [],
  tripId,
  userRole,
  onUpdate
}: {
  places: any[];
  tripId: string;
  userRole: string;
  onUpdate: () => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderedPlaces, setOrderedPlaces] = useState(places);
  
  useEffect(() => {
    setOrderedPlaces(places);
  }, [places]);
  
  const handleReorder = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(orderedPlaces);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setOrderedPlaces(items);
    
    // Solo guardar si el usuario tiene permisos
    if (userRole === 'owner' || userRole === 'editor') {
      try {
        setLoading(true);
        
        // Actualizar posiciones en la base de datos
        const updates = items.map((item, index) => ({
          id: item.id,
          position_order: index + 1
        }));
        
        for (const update of updates) {
          await supabase
            .from('saved_places')
            .update({ position_order: update.position_order })
            .eq('id', update.id);
        }
        
        toast({
          title: "Orden actualizado",
          description: "Se ha actualizado el orden de los lugares"
        });
      } catch (error) {
        console.error("Error reordering places:", error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el orden",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  const canEdit = userRole === 'owner' || userRole === 'editor';
  
  if (loading) {
    return <Loader />;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Lugares guardados ({places.length})</h2>
        {canEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => {/* Navegar a buscar lugares */}}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Añadir lugar</span>
          </Button>
        )}
      </div>
      
      {places.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <MapPin className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No hay lugares guardados</h3>
          <p className="text-gray-500 mt-2">
            Añade lugares desde la sección de exploración
          </p>
          {canEdit && (
            <Button 
              className="mt-4" 
              onClick={() => {/* Navegar a explorar */}}
            >
              Explorar lugares
            </Button>
          )}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleReorder}>
          <Droppable droppableId="places">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {orderedPlaces.map((place, index) => (
                  <Draggable 
                    key={place.id} 
                    draggableId={place.id} 
                    index={index}
                    isDragDisabled={!canEdit}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <SavedPlaceCard 
                          place={place}
                          canEdit={canEdit}
                          onDelete={canEdit ? onUpdate : undefined}
                          priorityNumber={index + 1}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};