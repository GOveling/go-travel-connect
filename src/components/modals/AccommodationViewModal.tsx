import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";
import { X, Hotel, Plus, MapPin, Star, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import PlaceDetailModal from "./PlaceDetailModal";

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
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showPlaceDetailModal, setShowPlaceDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accommodationToDelete, setAccommodationToDelete] = useState<any>(null);

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

  const handleAccommodationClick = (accommodation: any) => {
    // Convert accommodation data to place format for modal
    const placeForModal = {
      id: accommodation.id,
      name: accommodation.name,
      location: accommodation.destination_name || accommodation.formatted_address || "Ubicación no disponible",
      description: accommodation.description || `Alojamiento en ${accommodation.destination_name}`,
      rating: accommodation.rating || 0,
      image: accommodation.image || '',
      category: 'accommodation',
      hours: "Estadía confirmada",
      website: "",
      phone: "",
      lat: accommodation.lat,
      lng: accommodation.lng,
      photos: accommodation.image ? [accommodation.image] : [],
      priceLevel: accommodation.price_level,
    };

    setSelectedPlace(placeForModal);
    setShowPlaceDetailModal(true);
  };

  const handleDeleteClick = (accommodation: any) => {
    setAccommodationToDelete(accommodation);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (accommodationToDelete) {
      await removeAccommodation(accommodationToDelete.id);
      setShowDeleteConfirm(false);
      setAccommodationToDelete(null);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg rounded-3xl shadow-2xl border-0">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl border-0 bg-white">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-2xl">
              <Hotel className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xl font-bold text-gray-800">Estadía para {trip?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {accommodations.length === 0 ? (
            // No accommodation - Show add button
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-3xl p-8 mx-auto max-w-sm">
                <Hotel className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  No hay alojamiento seleccionado
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Agrega un hotel, hostal o residencia donde te vas a quedar durante este viaje.
                </p>
                <Button 
                  onClick={addAccommodation}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-3" />
                  Agregar Estadía
                </Button>
              </div>
            </div>
          ) : (
            // Show current accommodations
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  Tu alojamiento
                </h3>
                <Button 
                  onClick={addAccommodation}
                  variant="outline"
                  className="border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-2xl px-6 py-2 font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar otro
                </Button>
              </div>
              
              <div className="space-y-4">
                {accommodations.map((accommodation) => (
                  <Card key={accommodation.id} className="border-0 shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardContent className="p-0" onClick={() => handleAccommodationClick(accommodation)}>
                      <div className="bg-green-500 h-2 w-full"></div>
                      <div className="p-6">
                        <div className="flex space-x-4">
                          {accommodation.image && (
                            <div className="flex-shrink-0">
                              <img
                                src={accommodation.image}
                                alt={accommodation.name}
                                className="w-24 h-24 object-cover rounded-xl shadow-md"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-xl mb-1">
                                  {accommodation.name}
                                </h4>
                                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                                  <MapPin className="h-4 w-4" />
                                  <span className="text-sm">{accommodation.destination_name}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click when deleting
                                  handleDeleteClick(accommodation);
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl p-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {accommodation.rating > 0 && (
                                <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                  <span className="text-sm font-semibold text-yellow-800">{accommodation.rating}</span>
                                </div>
                              )}
                              <div className="bg-green-100 px-4 py-1 rounded-full">
                                <span className="text-sm font-semibold text-green-800">🏨 Estadía confirmada</span>
                              </div>
                            </div>
                            
                            {accommodation.description && (
                              <p className="text-sm text-gray-700 bg-white/50 p-3 rounded-xl">
                                {accommodation.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-3xl">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-8 py-2 rounded-2xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
          >
            Cerrar
          </Button>
        </div>

        {/* Place Detail Modal */}
        <PlaceDetailModal
          place={selectedPlace}
          isOpen={showPlaceDetailModal}
          onClose={() => {
            setShowPlaceDetailModal(false);
            setSelectedPlace(null);
          }}
          isFromSavedPlaces={true}
          onAddToTrip={() => {
            // Accommodation is already added, just close modal
            setShowPlaceDetailModal(false);
          }}
          sourceTrip={trip}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                <div className="bg-red-100 p-2 rounded-xl mr-3">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                Eliminar alojamiento
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 leading-relaxed">
                ¿Estás seguro de que deseas eliminar <strong>{accommodationToDelete?.name}</strong> de tu viaje? 
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="space-x-3">
              <AlertDialogCancel className="rounded-2xl border-2 border-gray-300 px-6 py-2 hover:bg-gray-50">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white rounded-2xl px-6 py-2 font-semibold"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default AccommodationViewModal;