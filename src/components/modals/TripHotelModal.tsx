import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Search, Hotel, Star, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TripHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any;
  onHotelAdded?: () => void;
}

interface Hotel {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  price_level?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
  }>;
  business_status?: string;
  types: string[];
}

export const TripHotelModal = ({ isOpen, onClose, trip, onHotelAdded }: TripHotelModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setHotels([]);
      // Auto-search if trip has destination
      if (trip?.destination) {
        const destinations = Array.isArray(trip.destination) ? trip.destination : [trip.destination];
        const mainDestination = destinations[0] || "";
        setSearchQuery(`${mainDestination} hotels`);
        handleSearch(`${mainDestination} hotels`);
      }
    }
  }, [isOpen, trip]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      toast({
        title: "Por favor ingresa un término de búsqueda",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: {
          query: searchTerm,
          type: 'lodging'
        }
      });

      if (error) throw error;

      if (data?.results) {
        setHotels(data.results);
      } else {
        setHotels([]);
        toast({
          title: "No se encontraron hoteles",
          description: "Intenta con otro término de búsqueda",
        });
      }
    } catch (error) {
      console.error("Error searching hotels:", error);
      toast({
        title: "Error al buscar hoteles",
        description: "No se pudo realizar la búsqueda. Intenta nuevamente.",
        variant: "destructive",
      });
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHotel = async (hotel: Hotel) => {
    if (!user || !trip) return;

    setSaving(true);
    try {
      const hotelData = {
        trip_id: trip.id,
        name: hotel.name,
        formatted_address: hotel.formatted_address,
        lat: hotel.geometry.location.lat,
        lng: hotel.geometry.location.lng,
        place_reference: hotel.place_id,
        place_source: 'google_places',
        category: 'hotel',
        rating: hotel.rating || 0,
        description: `Hotel agregado: ${hotel.name}`,
        priority: 'high',
        position_order: 0
      };

      const { error } = await supabase
        .from('saved_places')
        .insert(hotelData);

      if (error) throw error;

      toast({
        title: "Hotel agregado exitosamente",
        description: `${hotel.name} se ha agregado a tu viaje`,
      });

      onHotelAdded?.();
      onClose();
    } catch (error) {
      console.error("Error adding hotel:", error);
      toast({
        title: "Error al agregar hotel",
        description: "No se pudo agregar el hotel al viaje",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getPriceLevel = (level?: number) => {
    if (!level) return "Precio no disponible";
    const symbols = "€".repeat(level);
    return symbols;
  };

  const getPhotoUrl = (photoReference?: string) => {
    if (!photoReference) return null;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Hotel className="h-6 w-6 text-blue-600" />
            Agregar Hotel a {trip?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Buscar hoteles
              </Label>
              <Input
                id="search"
                placeholder="Buscar hoteles por ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <Button 
              onClick={() => handleSearch()}
              disabled={loading}
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : hotels.length > 0 ? (
            <div className="space-y-4">
              {hotels.map((hotel) => (
                <Card key={hotel.place_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {hotel.photos?.[0] ? (
                          <img
                            src={getPhotoUrl(hotel.photos[0].photo_reference) || ""}
                            alt={hotel.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Hotel className="h-8 w-8 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg mb-1 truncate">
                              {hotel.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 truncate">
                                {hotel.formatted_address}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {hotel.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium">
                                    {hotel.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                              
                              {hotel.price_level && (
                                <Badge variant="outline">
                                  {getPriceLevel(hotel.price_level)}
                                </Badge>
                              )}
                              
                              {hotel.business_status === 'OPERATIONAL' && (
                                <Badge variant="secondary">
                                  Disponible
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleAddHotel(hotel)}
                            disabled={saving}
                            className="ml-4 flex-shrink-0"
                          >
                            {saving ? "Agregando..." : "Agregar"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12">
              <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron hoteles
              </h3>
              <p className="text-gray-500">
                Intenta buscar con otros términos o ubicación diferente
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Hotel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Busca hoteles para tu viaje
              </h3>
              <p className="text-gray-500">
                Ingresa una ciudad o ubicación para encontrar hoteles
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};