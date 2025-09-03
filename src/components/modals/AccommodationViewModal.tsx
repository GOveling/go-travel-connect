import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";
import { X, Hotel, Plus, MapPin, Star, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface AccommodationViewModalProps {
  trip: any;
  isOpen: boolean;
  onClose: () => void;
}

const AccommodationViewModal = ({ trip, isOpen, onClose }: AccommodationViewModalProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load existing accommodations
  useEffect(() => {
    if (trip && isOpen) {
      loadAccommodations();
    }
  }, [trip, isOpen]);

  const loadAccommodations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_places')
        .select('*')
        .eq('trip_id', trip.id)
        .eq('category', 'accommodation')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccommodations(data || []);
    } catch (error) {
      console.error('Error loading accommodations:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeAccommodation = async (accommodationId: string) => {
    try {
      const { error } = await supabase
        .from('saved_places')
        .delete()
        .eq('id', accommodationId);

      if (error) throw error;

      toast({
        title: t("trips.accommodation.accommodationRemoved"),
        description: t("trips.accommodation.accommodationRemovedDescription"),
      });

      loadAccommodations();
    } catch (error) {
      console.error('Error removing accommodation:', error);
      toast({
        title: "Error",
        description: t("trips.accommodation.errorRemoving"),
        variant: "destructive",
      });
    }
  };

  const addAccommodation = () => {
    // Navigate to Explore section with accommodation context
    const event = new CustomEvent("navigateToExplore", { 
      detail: { 
        sourceTrip: trip,
        searchType: 'accommodation'
      } 
    });
    window.dispatchEvent(event);
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Hotel className="h-5 w-5 text-green-600" />
            <span>Estadía para {trip?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {accommodations.length === 0 ? (
            // No accommodation - Show add button
            <div className="text-center py-12">
              <Hotel className="h-16 w-16 mx-auto mb-6 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No hay alojamiento seleccionado
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Agrega un hotel, hostal o residencia donde te vas a quedar durante este viaje.
              </p>
              <Button 
                onClick={addAccommodation}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Agregar Estadía
              </Button>
            </div>
          ) : (
            // Show current accommodations
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Tu alojamiento
                </h3>
                <Button 
                  onClick={addAccommodation}
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar otro
                </Button>
              </div>
              
              <div className="space-y-3">
                {accommodations.map((accommodation) => (
                  <Card key={accommodation.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        {accommodation.image && (
                          <div className="flex-shrink-0">
                            <img
                              src={accommodation.image}
                              alt={accommodation.name}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {accommodation.name}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                <MapPin className="h-3 w-3" />
                                <span>{accommodation.destination_name}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAccommodation(accommodation.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {accommodation.rating > 0 && (
                              <Badge variant="secondary" className="flex items-center space-x-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{accommodation.rating}</span>
                              </Badge>
                            )}
                            <Badge className="bg-green-100 text-green-800">
                              🏨 Estadía confirmada
                            </Badge>
                          </div>
                          
                          {accommodation.description && (
                            <p className="text-sm text-gray-600 mt-2">
                              {accommodation.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccommodationViewModal;