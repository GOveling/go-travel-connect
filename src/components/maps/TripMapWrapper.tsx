import { lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

// Import lazy del componente del mapa para evitar SSR con fallback mejorado
const TripMapInteractiveComponent = lazy(() =>
  import("./TripMapInteractive").catch(() => {
    console.error("Failed to load TripMapInteractive component");
    // Fallback component cuando falla la carga
    return {
      default: () => (
        <div className="h-96 flex items-center justify-center text-red-500">
          Map component failed to load
        </div>
      ),
    };
  })
);

const MapLoadingFallback = () => (
  <Card className="h-96 bg-gradient-to-br from-purple-100 to-orange-100 border-2 border-dashed border-purple-300">
    <CardContent className="h-full flex items-center justify-center">
      <div className="text-center">
        <MapPin
          size={48}
          className="mx-auto text-purple-600 mb-4 animate-pulse"
        />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Cargando Mapa Interactivo...
        </h3>
        <p className="text-gray-600">Preparando vista de tus viajes</p>
      </div>
    </CardContent>
  </Card>
);

interface TripMapWrapperProps {
  trips: any[];
}

const TripMapWrapper = ({ trips }: TripMapWrapperProps) => {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <TripMapInteractiveComponent trips={trips} />
    </Suspense>
  );
};

export default TripMapWrapper;
