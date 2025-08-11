import ExploreAddToTripModal from "@/components/modals/ExploreAddToTripModal";
import PlaceDetailModal from "@/components/modals/PlaceDetailModal";
import PlaceMapModal from "@/components/modals/PlaceMapModal";
import { useToast } from "@/hooks/use-toast";
import { useAddToTrip } from "@/hooks/useAddToTrip";
import { useLanguage } from "@/hooks/useLanguage";
import { useCallback, useState } from "react";
import ExploreFilters from "./explore/ExploreFilters";
import ExploreResults from "./explore/ExploreResults";
import ExploreSearchBar from "./explore/ExploreSearchBar";
import ExploreHero from "./explore/ExploreHero";
import BottomSafeAdSlot from "@/components/ads/BottomSafeAdSlot";
import CongratsOverlay from "@/components/feedback/CongratsOverlay";
interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  category: string;
  image?: string;
  description?: string;
  hours?: string;
  phone?: string;
  website?: string;
  priceLevel?: number;
  confidence_score?: number;
  geocoded?: boolean;
  business_status?: string;
  photos?: string[];
  reviews_count?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

interface ExploreSectionProps {
  sourceTrip?: any;
  onClearSourceTrip?: () => void;
}

const ExploreSection = ({
  sourceTrip,
  onClearSourceTrip,
}: ExploreSectionProps) => {
  const { toast } = useToast();
  const { addPlaceToTrip } = useAddToTrip();
  const { t } = useLanguage();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [placeForTrip, setPlaceForTrip] = useState<any>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocationPlace, setSelectedLocationPlace] = useState<any>(null);
  const [showCongrats, setShowCongrats] = useState(false);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  const handleSearchSubmit = async (query: string) => {
    setSearchQuery(query);
    setSelectedPlaceId(null);
    // Clear search results when doing a new search
    setSearchResults([]);
  };

  const handleShowRelatedPlaces = async (place: any) => {
    console.log("Mostrando lugares basados en resultados para:", place);
    setSelectedPlaceId(place.place_id || place.id);

    try {
      toast({
        title: "Lugar Seleccionado",
        description: `Mostrando detalles para ${place.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al mostrar detalles del lugar. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handlePlaceClick = (place: Place) => {
    // Convert to enhanced format for modal, using official place_id and avoiding artificial ratings
    const enhancedPlace = {
      id: place.id, // Use official Google place_id
      name: place.name,
      location: place.address,
      description: place.description || `${place.category} in ${place.address}`,
      rating: place.rating, // Don't use artificial fallback rating
      image: place.image,
      category: place.category,
      hours: place.opening_hours?.open_now
        ? "Open now"
        : place.hours || "Hours vary",
      website: place.website || "",
      phone: place.phone || "",
      lat: place.coordinates.lat,
      lng: place.coordinates.lng,
      // Enhanced data
      business_status: place.business_status,
      photos: place.photos || [], // Pass all photos array
      reviews_count: place.reviews_count,
      priceLevel: place.priceLevel,
      opening_hours: place.opening_hours,
    };

    setSelectedPlace(enhancedPlace);
    setIsModalOpen(true);
  };

  // Function to handle results from the enhanced search bar
  const handleSearchResults = useCallback(
    (results: Place[], selectedId?: string) => {
      // Filtrar resultados sin coordenadas válidas
      const hasValidCoords = (p: Place) =>
        p &&
        p.coordinates &&
        Number.isFinite(p.coordinates.lat) &&
        Number.isFinite(p.coordinates.lng);
      const filtered = results.filter(hasValidCoords);

      // Mostrar TODOS los resultados válidos; reordenar si hay uno seleccionado
      if (selectedId) {
        const selectedPlace = filtered.find((place) => place.id === selectedId);
        const otherPlaces = filtered.filter((place) => place.id !== selectedId);
        setSearchResults(selectedPlace ? [selectedPlace, ...otherPlaces] : filtered);
        setSelectedPlaceId(selectedId);
      } else {
        setSearchResults(filtered);
        setSelectedPlaceId(null);
      }
    },
    []
  );

  const handleLoadingChange = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const handleAddToTrip = useCallback(async () => {
    if (!selectedPlace) return;

    const placeData = {
      name: selectedPlace.name,
      location: selectedPlace.location,
      rating: selectedPlace.rating,
      image: selectedPlace.image,
      category: selectedPlace.category,
      description: selectedPlace.description,
      lat: selectedPlace.lat,
      lng: selectedPlace.lng,
    };

    // If we have a source trip, add directly to it
    if (sourceTrip) {
      try {
        const success = await addPlaceToTrip(sourceTrip.id, placeData);

          if (success) {
            toast({
              title: "Lugar agregado",
              description: `${selectedPlace.name} fue agregado a ${sourceTrip.name}`,
            });
            setIsModalOpen(false);
            onClearSourceTrip?.();
            setShowCongrats(true);
            setTimeout(() => {
              // Navigate back to trips section
              const event = new CustomEvent("navigateToTrips");
              window.dispatchEvent(event);
            }, 1400);
          }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo agregar el lugar al viaje",
          variant: "destructive",
        });
      }
    } else {
      // Show normal trip selection modal
      setPlaceForTrip(placeData);
      setIsAddToTripModalOpen(true);
      setIsModalOpen(false);
    }
  }, [selectedPlace, sourceTrip, onClearSourceTrip, toast, addPlaceToTrip]);

  const handleShowLocation = (place: Place) => {
    setSelectedLocationPlace({
      id: place.id,
      name: place.name,
      lat: place.coordinates.lat,
      lng: place.coordinates.lng,
      address: place.address,
    });
    setIsLocationModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="p-4">
            <ExploreHero
              title={t("explore.title")}
              subtitle={t("explore.subtitle")}
              onExploreClick={() => {}}
            />

          {/* Search Controls - Filtros y Búsqueda más juntos */}
          <div className="space-y-2">
            <ExploreFilters
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              onClearFilters={handleClearFilters}
            />

            <ExploreSearchBar
              selectedCategories={selectedCategories}
              onSearchSubmit={handleSearchSubmit}
              onShowRelatedPlaces={handleShowRelatedPlaces}
              onSearchResults={handleSearchResults}
              onLoadingChange={handleLoadingChange}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-4">
        <ExploreResults
          places={searchResults}
          loading={loading}
          onPlaceClick={handlePlaceClick}
          onShowLocation={handleShowLocation}
          searchQuery={searchQuery}
          selectedPlaceId={selectedPlaceId}
        />
      </div>

      {/* Place Detail Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (sourceTrip && onClearSourceTrip) {
            onClearSourceTrip();
          }
        }}
        onAddToTrip={handleAddToTrip}
        sourceTrip={sourceTrip}
      />

      {/* Add to Trip Modal */}
      <ExploreAddToTripModal
        isOpen={isAddToTripModalOpen}
        onClose={() => setIsAddToTripModalOpen(false)}
        selectedPlace={placeForTrip}
        onSuccess={() => setShowCongrats(true)}
      />

      {/* Place Map Modal */}
      <PlaceMapModal
        place={selectedLocationPlace}
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setSelectedLocationPlace(null);
        }}
      />

      {/* Overlays and Ad Slot */}
      <CongratsOverlay open={showCongrats} onClose={() => setShowCongrats(false)} />
      <BottomSafeAdSlot />
    </div>
  );
};

export default ExploreSection;
