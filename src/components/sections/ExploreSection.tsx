import ExploreAddToTripModal from "@/components/modals/ExploreAddToTripModal";
import PlaceDetailModal from "@/components/modals/PlaceDetailModal";
import PlaceMapModal from "@/components/modals/PlaceMapModal";
import ExploreMapModal from "@/components/modals/ExploreMapModal";
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
import { NearbyLocationToggle } from "./explore/NearbyLocationToggle";
import { filterPlacesByDistance } from "@/utils/locationUtils";
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
  searchType?: string;
  onClearSourceTrip?: () => void;
}

const ExploreSection = ({
  sourceTrip,
  searchType,
  onClearSourceTrip,
}: ExploreSectionProps) => {
  const { toast } = useToast();
  const { addPlaceToTrip } = useAddToTrip();
  const { t } = useLanguage();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [allSearchResults, setAllSearchResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [placeForTrip, setPlaceForTrip] = useState<any>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocationPlace, setSelectedLocationPlace] = useState<any>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isNearbyEnabled, setIsNearbyEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isExploreMapModalOpen, setIsExploreMapModalOpen] = useState(false);
  const [placeFromMap, setPlaceFromMap] = useState<Place | null>(null);

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

      // Store all results for potential reference
      setAllSearchResults(filtered);

      // If nearby is enabled, the API already filtered by location
      // No need to do additional filtering here
      const finalResults = filtered;

      // Mostrar TODOS los resultados válidos; reordenar si hay uno seleccionado
      if (selectedId) {
        const selectedPlace = finalResults.find((place) => place.id === selectedId);
        const otherPlaces = finalResults.filter((place) => place.id !== selectedId);
        setSearchResults(selectedPlace ? [selectedPlace, ...otherPlaces] : finalResults);
        setSelectedPlaceId(selectedId);
      } else {
        setSearchResults(finalResults);
        setSelectedPlaceId(null);
      }
    },
    []
  );

  const handleLoadingChange = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const handleNearbyToggle = useCallback((enabled: boolean) => {
    setIsNearbyEnabled(enabled);
    // When toggling, clear current results to force a new search
    // This ensures the search will use the new location preference
    setSearchResults([]);
    setAllSearchResults([]);
  }, []);

  const handleLocationChange = useCallback((location: { lat: number; lng: number } | null) => {
    setUserLocation(location);
    // When location changes, clear current results to force a new search
    if (isNearbyEnabled) {
      setSearchResults([]);
      setAllSearchResults([]);
    }
  }, [isNearbyEnabled]);

  const handleAddToTrip = useCallback(async () => {
    if (!selectedPlace) return;

    const placeData = {
      name: selectedPlace.name,
      location: selectedPlace.location,
      rating: selectedPlace.rating,
      image: selectedPlace.image,
      category: searchType === 'accommodation' ? 'accommodation' : selectedPlace.category,
      description: selectedPlace.description,
      lat: selectedPlace.lat,
      lng: selectedPlace.lng,
    };

    // If we have a source trip, add directly to it
    if (sourceTrip) {
      try {
        const success = await addPlaceToTrip(sourceTrip.id, placeData);

          if (success) {
            const toastTitle = searchType === 'accommodation' 
              ? "Alojamiento agregado"
              : "Lugar agregado";
            const toastDescription = searchType === 'accommodation'
              ? `${selectedPlace.name} fue agregado como estadía para ${sourceTrip.name}`
              : `${selectedPlace.name} fue agregado a ${sourceTrip.name}`;
              
            toast({
              title: toastTitle,
              description: toastDescription,
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
        const errorMessage = searchType === 'accommodation'
          ? "No se pudo agregar el alojamiento al viaje"
          : "No se pudo agregar el lugar al viaje";
          
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } else {
      // Show normal trip selection modal
      setPlaceForTrip(placeData);
      setIsAddToTripModalOpen(true);
      setIsModalOpen(false);
    }
  }, [selectedPlace, sourceTrip, searchType, onClearSourceTrip, toast, addPlaceToTrip]);

  const handlePlaceSelectFromMap = useCallback((place: Place) => {
    // Convert map place to modal format and open detail modal
    const enhancedPlace = {
      id: place.id,
      name: place.name,
      location: place.address,
      description: place.description || `${place.category} in ${place.address}`,
      rating: place.rating,
      image: place.image,
      category: place.category,
      hours: place.opening_hours?.open_now
        ? "Open now"
        : place.hours || "Hours vary",
      website: place.website || "",
      phone: place.phone || "",
      lat: place.coordinates.lat,
      lng: place.coordinates.lng,
      business_status: place.business_status,
      photos: place.photos || [],
      reviews_count: place.reviews_count,
      priceLevel: place.priceLevel,
      opening_hours: place.opening_hours,
    };

    setSelectedPlace(enhancedPlace);
    setPlaceFromMap(place);
    setIsModalOpen(true);
  }, []);

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

  // Determine if scrolling should be allowed
  const shouldAllowScroll = !loading && (searchResults.length > 0 || !searchQuery);

  return (
    <div className={`min-h-screen bg-gray-50 pb-28 ${!shouldAllowScroll ? 'overflow-hidden' : ''}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="p-4">
          {sourceTrip && searchType === 'accommodation' ? (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                🏨 Buscando alojamiento para: <span className="font-bold">{sourceTrip.name}</span>
              </p>
            </div>
          ) : sourceTrip ? (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm font-medium">
                ✈️ Agregando lugares a: <span className="font-bold">{sourceTrip.name}</span>
              </p>
            </div>
          ) : null}
          
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

            <NearbyLocationToggle
              isNearbyEnabled={isNearbyEnabled}
              onToggle={handleNearbyToggle}
              onLocationChange={handleLocationChange}
              onShowMap={() => setIsExploreMapModalOpen(true)}
              hasResults={searchResults.length > 0}
            />

            <ExploreSearchBar
              selectedCategories={searchType === 'accommodation' ? ['lodging'] : selectedCategories}
              onSearchSubmit={handleSearchSubmit}
              onShowRelatedPlaces={handleShowRelatedPlaces}
              onSearchResults={handleSearchResults}
              onLoadingChange={handleLoadingChange}
              userLocation={userLocation}
              isNearbyEnabled={isNearbyEnabled}
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

      {/* Explore Results Map Modal */}
      <ExploreMapModal
        places={searchResults}
        isOpen={isExploreMapModalOpen}
        onClose={() => setIsExploreMapModalOpen(false)}
        onPlaceSelect={handlePlaceSelectFromMap}
      />

      {/* Overlays and Ad Slot */}
      <CongratsOverlay open={showCongrats} onClose={() => setShowCongrats(false)} />
      <BottomSafeAdSlot />
    </div>
  );
};

export default ExploreSection;
