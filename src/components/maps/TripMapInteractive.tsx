import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  Eye,
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  TrendingUp,
  Bookmark,
} from "lucide-react";
import MapFilters from "./MapFilters";
import TripSelector from "./TripSelector";
import { useMapData } from "@/hooks/useMapData";

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
  const mapRef = useRef<L.Map | null>(null);
  const [mapStyle, setMapStyle] = useState("street");
  const [showRoutes, setShowRoutes] = useState(true);
  const [showSavedPlaces, setShowSavedPlaces] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

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
    type: "destination" | "savedPlace" = "destination"
  ) => {
    const color =
      status === "upcoming"
        ? "#10b981"
        : status === "planning"
          ? "#8b5cf6"
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
          ${type === "savedPlace" ? "📍" : emoji}
        </div>
      `,
      className: "custom-marker",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

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
      case "completed":
        return "#6b7280";
      default:
        return "#6b7280";
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-800">Mapa Interactivo</h3>
              <span className="text-sm text-gray-500">
                {stats.totalTrips} viajes • {stats.totalDestinations} destinos
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Map Style Selector */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={mapStyle === "street" ? "default" : "ghost"}
                  onClick={() => setMapStyle("street")}
                  className="h-8 px-3"
                >
                  <Layers size={16} className="mr-1" />
                  Mapa
                </Button>
                <Button
                  size="sm"
                  variant={mapStyle === "satellite" ? "default" : "ghost"}
                  onClick={() => setMapStyle("satellite")}
                  className="h-8 px-3"
                >
                  Satélite
                </Button>
                <Button
                  size="sm"
                  variant={mapStyle === "terrain" ? "default" : "ghost"}
                  onClick={() => setMapStyle("terrain")}
                  className="h-8 px-3"
                >
                  Terreno
                </Button>
              </div>

              {/* Route Toggle */}
              <Button
                size="sm"
                variant={showRoutes ? "default" : "outline"}
                onClick={() => setShowRoutes(!showRoutes)}
                className="h-8"
              >
                <Navigation size={16} className="mr-1" />
                Rutas
              </Button>

              {/* Saved Places Toggle */}
              <Button
                size="sm"
                variant={showSavedPlaces ? "default" : "outline"}
                onClick={() => setShowSavedPlaces(!showSavedPlaces)}
                className="h-8"
              >
                <Bookmark size={16} className="mr-1" />
                Lugares
              </Button>

              {/* Fit to Bounds */}
              <Button
                size="sm"
                variant="outline"
                onClick={fitMapToMarkers}
                className="h-8"
              >
                <Eye size={16} className="mr-1" />
                Ver Todo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-96 lg:h-[500px] relative">
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

              {/* Saved Places Markers */}
              {showSavedPlaces &&
                filteredTrips.map((trip) =>
                  trip.savedPlaces
                    ?.filter((place: any) => place.lat && place.lng)
                    .map((place: any, index: number) => (
                      <Marker
                        key={`saved-${trip.id}-${place.id}`}
                        position={[place.lat, place.lng]}
                        icon={createCustomIcon(
                          trip.status,
                          place.image || "📍",
                          "savedPlace"
                        )}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h4 className="font-semibold text-lg mb-2">
                              {place.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {place.destinationName}
                            </p>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {place.category}
                              </span>
                              <span className="text-sm">⭐ {place.rating}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {place.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>⏱️ {place.estimatedTime}</span>
                              <span
                                className={`px-2 py-1 rounded ${
                                  place.priority === "high"
                                    ? "bg-red-100 text-red-800"
                                    : place.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {place.priority}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-purple-600">
                              📅 {trip.name}
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
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trip Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Leyenda del Mapa</h4>

          {/* Status Legend */}
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Estados de Viaje:
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">Próximos Viajes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <span className="text-sm text-gray-700">
                    En Planificación
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                  <span className="text-sm text-gray-700">Completados</span>
                </div>
              </div>
            </div>

            {/* Marker Types */}
            <div className="pt-3 border-t">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Tipos de Marcadores:
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">
                    ✈️
                  </div>
                  <span className="text-sm text-gray-700">
                    Destinos del Viaje (Grande)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">
                    📍
                  </div>
                  <span className="text-sm text-gray-700">
                    Lugares Guardados (Pequeño)
                  </span>
                </div>
              </div>
            </div>

            {/* Routes Legend */}
            {showRoutes && (
              <div className="pt-3 border-t">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Rutas:
                </h5>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-0.5 bg-purple-600"></div>
                    <span className="text-sm text-gray-700">
                      Ruta Confirmada
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
                      Ruta en Planificación
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="pt-3 border-t">
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Haz clic en los marcadores para ver detalles</div>
                <div>
                  • Los lugares guardados aparecen como marcadores pequeños
                </div>
                <div>• Usa los filtros para personalizar la vista del mapa</div>
                <div>
                  • Selecciona un viaje específico para ver solo sus destinos
                </div>
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
            <div className="text-sm text-gray-600">Total Viajes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.upcomingTrips}
            </div>
            <div className="text-sm text-gray-600">Próximos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.planningTrips}
            </div>
            <div className="text-sm text-gray-600">Planificando</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {stats.totalDestinations}
            </div>
            <div className="text-sm text-gray-600">Destinos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalSavedPlaces}
            </div>
            <div className="text-sm text-gray-600">Lugares Guardados</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripMapInteractive;
