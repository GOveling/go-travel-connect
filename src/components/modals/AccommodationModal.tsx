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
import { X, Hotel, Search, MapPin, Star, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface AccommodationModalProps {
  trip: any;
  isOpen: boolean;
  onClose: () => void;
}

interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  category: string;
  image?: string;
  description?: string;
  photos?: string[];
  priceLevel?: number;
  website?: string;
  phone?: string;
}

const AccommodationModal = ({ trip, isOpen, onClose }: AccommodationModalProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedAccommodations, setSavedAccommodations] = useState<any[]>([]);

  // Load existing accommodations
  useEffect(() => {
    if (trip && isOpen) {
      loadAccommodations();
    }
  }, [trip, isOpen]);

  const loadAccommodations = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_places')
        .select('*')
        .eq('trip_id', trip.id)
        .eq('category', 'accommodation')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedAccommodations(data || []);
    } catch (error) {
      console.error('Error loading accommodations:', error);
    }
  };

  const searchAccommodations = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: {
          query: `${searchQuery} hotel accommodation`,
          categories: ['lodging'],
          limit: 10,
        },
      });

      if (error) throw error;

      const places = data?.places || [];
      setSearchResults(places);
    } catch (error) {
      console.error('Error searching accommodations:', error);
      toast({
        title: "Error",
        description: t("trips.accommodation.errorSearching"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addAccommodation = async (place: Place) => {
    try {
      const { error } = await supabase
        .from('saved_places')
        .insert({
          trip_id: trip.id,
          name: place.name,
          category: 'accommodation',
          rating: place.rating || 0,
          image: place.image || place.photos?.[0] || '',
          description: place.description || `Alojamiento en ${place.address}`,
          estimated_time: '1 noche',
          priority: 'high',
          destination_name: place.address,
          lat: place.coordinates.lat,
          lng: place.coordinates.lng,
          formatted_address: place.address,
          place_source: 'google_places',
          place_reference: place.id,
        });

      if (error) throw error;

      toast({
        title: t("trips.accommodation.accommodationAdded"),
        description: `${place.name} ${t("trips.accommodation.accommodationAddedDescription")} ${trip.name}`,
      });

      loadAccommodations();
      setSearchResults([]);
      setSearchQuery("");
    } catch (error) {
      console.error('Error adding accommodation:', error);
      toast({
        title: "Error",
        description: t("trips.accommodation.errorAdding"),
        variant: "destructive",
      });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Hotel className="h-5 w-5 text-green-600" />
            <span>{t("trips.accommodation.title")} {trip?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {t("trips.accommodation.searchAccommodation")}
            </h3>
            
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder={t("trips.accommodation.searchAccommodation")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchAccommodations()}
                />
              </div>
              <Button 
                onClick={searchAccommodations}
                disabled={loading || !searchQuery.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">{t("trips.accommodation.searchResults")}</h4>
              <div className="grid gap-4">
                {searchResults.map((place) => (
                  <Card key={place.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        {place.image && (
                          <img
                            src={place.image}
                            alt={place.name}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-semibold text-gray-900">{place.name}</h5>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span>{place.address}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addAccommodation(place)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {t("trips.accommodation.add")}
                            </Button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {place.rating && (
                              <Badge variant="secondary" className="flex items-center space-x-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{place.rating}</span>
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {place.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Current Accommodations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {t("trips.accommodation.currentAccommodation")}
            </h3>
            
            {savedAccommodations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Hotel className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>{t("trips.accommodation.noAccommodation")}</p>
                <p className="text-sm">{t("trips.accommodation.searchPlaceholder")}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {savedAccommodations.map((accommodation) => (
                  <Card key={accommodation.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        {accommodation.image && (
                          <img
                            src={accommodation.image}
                            alt={accommodation.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-semibold text-gray-900">{accommodation.name}</h5>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span>{accommodation.destination_name}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeAccommodation(accommodation.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
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
                              {t("trips.accommodation.confirmed")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t("trips.accommodation.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccommodationModal;