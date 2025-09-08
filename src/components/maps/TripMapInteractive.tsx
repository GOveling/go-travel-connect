import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useMapData } from "@/hooks/useMapData";
import L from "leaflet";
import {
  Bookmark,
  Eye,
  Layers,
  Mountain,
  Navigation,
  Satellite,
  Users,
  LocateFixed,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Circle,
} from "react-leaflet";
import MapFilters from "./MapFilters";
import TripSelector from "./TripSelector";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useToast } from "@/hooks/use-toast";
// Configuración de iconos de Leaflet
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface TripMapInteractiveProps {
  trips: any[];
}

const TripMapInteractive = ({ trips }: TripMapInteractiveProps) => {
  const { t } = useLanguage();
  const mapRef = useRef<L.Map | null>(null);
  const [mapStyle, setMapStyle] = useState("street");
  const [showRoutes, setShowRoutes] = useState(true);
  const [showSavedPlaces, setShowSavedPlaces] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const {
    location,
    isLocating,
    error,
    getCurrentLocation,
    startWatching,
    stopWatching,
  } = useUserLocation();
  const { toast } = useToast();
  const [showUserLocation, setShowUserLocation] = useState(false);

  // Use the custom hook for map data management
  const {
    filteredTrips,
    allCoordinates,
    mapCenter,
    filters,
    stats,
    updateFilters,
    toggleStatusFilter,
    resetFilters,
    selectTrip,
  } = useMapData(trips);

  // Create custom icons for different trip statuses and types
  const createCustomIcon = (
    status: string,
    emoji: string,
    type: "destination" | "savedPlace" = "destination",
    positionNumber?: number
  ) => {
    const color =
      status === "upcoming"
        ? "#10b981"
        : status === "planning"
          ? "#8b5cf6"
          : status === "traveling"
            ? "#3b82f6"
            : "#6b7280";

    const size = type === "savedPlace" ? 30 : 40;
    const borderWidth = type === "savedPlace" ? 2 : 3;

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${type === "savedPlace" ? "12px" : "18px"};
          border: ${borderWidth}px solid ${type === "savedPlace" ? "#fff" : "white"};
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          ${type === "savedPlace" ? "opacity: 0.9;" : ""}
        ">
          ${type === "savedPlace" && positionNumber ? positionNumber : type === "savedPlace" ? "📍" : emoji}
        </div>
      `,
      className: "custom-marker",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const userIcon = L.divIcon({
    html: `<div style="
      background-color: #3b82f6;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(59,130,246,0.25);
      border: 2px solid white;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: "custom-user-icon",
  });

  // Fit map to show all markers
  const fitMapToMarkers = () => {
    if (!mapRef.current) return;

    const coords = allCoordinates.map((coord) => [coord.lat, coord.lng]);
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords as [number, number][]);
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  // Generate route line between coordinates of a trip
  const getTripRoute = (trip: any) => {
    if (!trip.coordinates || trip.coordinates.length < 2) return null;

    return trip.coordinates.map((coord: any) => [coord.lat, coord.lng]);
  };

  // Map style configurations
  const mapStyles = {
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  };

  useEffect(() => {
    // Auto-fit map when filtered trips change
    setTimeout(fitMapToMarkers, 100);
  }, [filteredTrips]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "#10b981";
      case "planning":
        return "#8b5cf6";
      case "traveling":
        return "#3b82f6";
      case "completed":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const handleToggleUserLocation = async () => {
    try {
      if (!showUserLocation) {
        await startWatching();
        const loc = await getCurrentLocation();
        if (loc && mapRef.current?.setView) {
          mapRef.current.setView([loc.lat, loc.lng], 14);
        }
      } else {
        await stopWatching();
      }
      setShowUserLocation((prev) => !prev);
    } catch (e) {
      toast({
        title: "Ubicación no disponible",
        description: error || "No se pudo obtener tu ubicación",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Trip Selector */}
      <TripSelector
        trips={trips}
        selectedTripId={filters.selectedTripId}
        onSelectTrip={selectTrip}
        showSavedPlaces={showSavedPlaces}
        onToggleSavedPlaces={() => setShowSavedPlaces(!showSavedPlaces)}
      />

      {/* Map Filters */}
      <MapFilters
        filters={filters}
        stats={stats}
        onToggleStatus={toggleStatusFilter}
        onUpdateFilters={updateFilters}
        onResetFilters={resetFilters}
      />

      {/* Map Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">
                  {t("trips.map.interactiveMap")}
                </h3>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {stats.totalTrips} {t("trips.title").toLowerCase()} •{" "}
                  {stats.totalDestinations} {t("trips.map.destinations")}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Map Style Selector */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant={mapStyle === "street" ? "default" : "ghost"}
                  onClick={() => setMapStyle("street")}
                  className="h-8 px-2 sm:px-3"
                >
                  <Layers size={16} className="mr-1" />
                  <span className="hidden xs:inline">
                    {t("trips.map.mapStyle")}
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant={mapStyle === "satellite" ? "default" : "ghost"}
                  onClick={() => setMapStyle("satellite")}
                  className="h-8 px-2 sm:px-3"
                >
                  <span className="hidden xs:inline">
                    {t("trips.map.satellite")}
                  </span>
                  <Satellite size={16} className="xs:hidden" />
                </Button>
                <Button
                  size="sm"
                  variant={mapStyle === "terrain" ? "default" : "ghost"}
                  onClick={() => setMapStyle("terrain")}
                  className="h-8 px-2 sm:px-3"
                >
                  <span className="hidden xs:inline">
                    {t("trips.map.terrain")}
                  </span>
                  <Mountain size={16} className="xs:hidden" />
                </Button>
              </div>

              {/* Route Toggle */}
              <Button
                size="sm"
                variant={showRoutes ? "default" : "outline"}
                onClick={() => setShowRoutes(!showRoutes)}
                className="h-8 flex-shrink-0"
              >
                <Navigation size={16} className="mr-1" />
                <span className="hidden xs:inline">
                  {t("trips.map.routes")}
                </span>
              </Button>

              {/* Saved Places Toggle */}
              <Button
                size="sm"
                variant={showSavedPlaces ? "default" : "outline"}
                onClick={() => setShowSavedPlaces(!showSavedPlaces)}
                className="h-8 flex-shrink-0"
              >
                <Bookmark size={16} className="mr-1" />
                <span className="hidden xs:inline">
                  {t("trips.map.savedPlaces")}
                </span>
              </Button>

              {/* Fit to Bounds */}
              <Button
                size="sm"
                variant="outline"
                onClick={fitMapToMarkers}
                className="h-8 flex-shrink-0"
              >
                <Eye size={16} className="mr-1" />
                <span className="hidden xs:inline">
                  {t("trips.map.viewAll")}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-96 lg:h-[500px] relative">
            <div className="absolute top-3 right-3 z-[1000]">
              <Button
                size="sm"
                variant={showUserLocation ? "default" : "outline"}
                onClick={handleToggleUserLocation}
                className="h-9"
                disabled={isLocating}
              >
                <LocateFixed size={16} className="mr-2" />
                {showUserLocation
                  ? "Ocultar ubicación"
                  : isLocating
                    ? "Localizando..."
                    : "Mi ubicación"}
              </Button>
            </div>
            <MapContainer
              center={mapCenter}
              zoom={4}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                url={mapStyles[mapStyle as keyof typeof mapStyles]}
                attribution={
                  mapStyle === "street"
                    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    : mapStyle === "satellite"
                      ? '&copy; <a href="https://www.esri.com/">Esri</a>'
                      : '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                }
              />

              {/* Accommodation Markers - shown with special hotel icon */}
              {showSavedPlaces &&
                filteredTrips.map((trip) =>
                  trip.savedPlaces
                    ?.filter((place: any) => place.lat && place.lng && place.category === 'accommodation')
                    .map((place: any, index: number) => (
                      <Marker
                        key={`accommodation-${trip.id}-${place.id}`}
                        position={[place.lat, place.lng]}
                        icon={L.divIcon({
                          html: `
                            <div style="
                              background-color: #9333ea;
                              width: 35px;
                              height: 35px;
                              border-radius: 50%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              font-size: 16px;
                              border: 3px solid white;
                              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                            ">
                              🏨
                            </div>
                          `,
                          className: "custom-accommodation-marker",
                          iconSize: [35, 35],
                          iconAnchor: [17.5, 17.5],
                        })}
                      >
                        <Popup className="mobile-optimized-popup">
                          <div className="p-3 max-w-[280px] sm:min-w-[300px]">
                            {/* Image section */}
                            {place.image && (
                              place.image.includes('http') || 
                              place.image.includes('maps.googleapis.com') || 
                              place.image.includes('places.googleapis.com') ||
                              place.image.includes('googleusercontent.com')
                            ) && (
                              <div className="mb-3 relative">
                                <img 
                                  src={place.image} 
                                  alt={place.name}
                                  className="w-full h-20 sm:h-24 object-cover rounded-lg shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                  loading="lazy"
                                />
                              </div>
                            )}
                            
                            {/* Header */}
                            <div className="flex items-start space-x-2 mb-2">
                              <span className="bg-purple-600 text-white text-lg rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                                🏨
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-base sm:text-lg leading-tight text-gray-900 break-words">
                                  {place.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                  📍 {place.destinationName}
                                </p>
                              </div>
                            </div>
                            
                            {/* Tags for accommodation */}
                            <div className="flex flex-wrap gap-1 mb-2">
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                🏨 Estadía Confirmada
                              </span>
                              {place.rating > 0 && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  ⭐ {place.rating}
                                </span>
                              )}
                            </div>
                            
                            {/* Description */}
                            {place.description && place.description.length > 0 && (
                              <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                {place.description}
                              </p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    ))
                )}

              {/* Trip Markers - Destinations */}
              {filteredTrips.map((trip) =>
                trip.coordinates?.map((coord: any, index: number) => (
                  <Marker
                    key={`dest-${trip.id}-${index}`}
                    position={[coord.lat, coord.lng]}
                    icon={createCustomIcon(
                      trip.status,
                      trip.image || "📍",
                      "destination"
                    )}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h4 className="font-semibold text-lg mb-2">
                          {trip.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {coord.name}
                        </p>
                        <div className="flex items-center space-x-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getStatusColor(trip.status),
                            }}
                          ></div>
                          <span className="text-sm capitalize">
                            {trip.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{trip.dates}</p>
                        {trip.isGroupTrip && (
                          <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full mt-2">
                            <Users size={12} className="text-purple-600" />
                            <span className="text-xs text-purple-600">
                              Viaje Grupal
                            </span>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))
              )}

              {/* Saved Places Markers (excluding accommodations shown separately) */}
              {showSavedPlaces &&
                filteredTrips.map((trip) =>
                  trip.savedPlaces
                    ?.filter((place: any) => place.lat && place.lng && place.category !== 'accommodation')
                    .map((place: any, index: number) => (
                      <Marker
                        key={`saved-${trip.id}-${place.id}`}
                        position={[place.lat, place.lng]}
                        icon={createCustomIcon(
                          trip.status,
                          place.category === 'accommodation' ? "🏨" : (place.image || "📍"),
                          "savedPlace",
                          place.positionOrder || index + 1
                        )}
                      >
                        <Popup className="mobile-optimized-popup">
                          <div className="p-3 max-w-[280px] sm:min-w-[300px]">
                            {/* Image section - mejorada detección URLs */}
                            {place.image &&
                              (place.image.includes("http") ||
                                place.image.includes("maps.googleapis.com") ||
                                place.image.includes("places.googleapis.com") ||
                                place.image.includes(
                                  "googleusercontent.com"
                                )) && (
                                <div className="mb-3 relative">
                                  <img
                                    src={place.image}
                                    alt={place.name}
                                    className="w-full h-20 sm:h-24 object-cover rounded-lg shadow-sm"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                    loading="lazy"
                                  />
                                </div>
                              )}

                            {/* Header con número y nombre */}
                            <div className="flex items-start space-x-2 mb-2">
                              <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                                {place.positionOrder || index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-base sm:text-lg leading-tight text-gray-900 break-words">
                                  {place.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                  📍 {place.destinationName}
                                </p>
                              </div>
                            </div>

                            {/* Tags compactos para móvil */}
                            <div className="flex flex-wrap gap-1 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                place.category === 'accommodation' 
                                  ? "bg-purple-100 text-purple-800" 
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                                {place.category === 'accommodation' ? '🏨 Estadía' : place.category}
                              </span>
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                ⭐ {place.rating}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  place.priority === "high"
                                    ? "bg-red-100 text-red-800"
                                    : place.priority === "medium"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {place.priority}
                              </span>
                            </div>

                            {/* Descripción limitada para móviles */}
                            {place.description &&
                              place.description.length > 0 && (
                                <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                                  {place.description}
                                </p>
                              )}

                            {/* Información adicional compacta */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>⏱️ {place.estimatedTime}</span>
                              <span className="text-purple-600">
                                📅 {trip.name}
                              </span>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))
                )}

              {/* Trip Routes */}
              {showRoutes &&
                filteredTrips.map((trip) => {
                  const route = getTripRoute(trip);
                  if (!route || route.length < 2) return null;

                  return (
                    <Polyline
                      key={`route-${trip.id}`}
                      positions={route as [number, number][]}
                      color={getStatusColor(trip.status)}
                      weight={3}
                      opacity={0.7}
                      dashArray={
                        trip.status === "planning" ? "10, 10" : undefined
                      }
                    />
                  );
                })}

              {showUserLocation && location && (
                <>
                  <Marker
                    position={[location.lat, location.lng]}
                    icon={userIcon}
                  />
                  <Circle
                    center={[location.lat, location.lng]}
                    radius={location.accuracy ?? 50}
                    pathOptions={{
                      color: "#3b82f6",
                      fillColor: "#3b82f6",
                      fillOpacity: 0.15,
                    }}
                  />
                </>
              )}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trip Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">{t("trips.map.legend.title")}</h4>

          {/* Status Legend */}
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                {t("trips.map.legend.tripStatus")}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">
                    {t("trips.map.legend.upcomingTrips")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <span className="text-sm text-gray-700">
                    {t("trips.map.legend.inPlanning")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700">
                    {t("trips.map.traveling")}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                  <span className="text-sm text-gray-700">
                    {t("trips.map.legend.completedTrips")}
                  </span>
                </div>
              </div>
            </div>


            {/* Routes Legend */}
            {showRoutes && (
              <div className="pt-3 border-t">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {t("trips.map.legend.routes")}
                </h5>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-0.5 bg-purple-600"></div>
                    <span className="text-sm text-gray-700">
                      {t("trips.map.legend.confirmedRoute")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-0.5 bg-purple-600"
                      style={{
                        background:
                          "repeating-linear-gradient(to right, #8b5cf6, #8b5cf6 3px, transparent 3px, transparent 6px)",
                      }}
                    ></div>
                    <span className="text-sm text-gray-700">
                      {t("trips.map.legend.planningRoute")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="pt-3 border-t">
              <div className="text-xs text-gray-500 space-y-1">
                <div>• {t("trips.map.legend.clickMarkers")}</div>
                <div>• {t("trips.map.legend.savedPlacesAppear")}</div>
                <div>• {t("trips.map.legend.useFilters")}</div>
                <div>• {t("trips.map.legend.selectSpecificTrip")}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalTrips}
            </div>
            <div className="text-sm text-gray-600">
              {t("trips.map.stats.totalTrips")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.upcomingTrips}
            </div>
            <div className="text-sm text-gray-600">
              {t("trips.map.stats.upcomingTrips")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.planningTrips}
            </div>
            <div className="text-sm text-gray-600">
              {t("trips.map.stats.planningTrips")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {stats.totalDestinations}
            </div>
            <div className="text-sm text-gray-600">
              {t("trips.map.stats.destinations")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalSavedPlaces}
            </div>
            <div className="text-sm text-gray-600">
              {t("trips.map.stats.savedPlaces")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripMapInteractive;
