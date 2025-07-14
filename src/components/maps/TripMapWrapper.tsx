import { lazy, Suspense, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import ClientOnly from "@/components/ui/ClientOnly";
import TripMapFallback from './TripMapFallback';

// Import lazy del componente del mapa para evitar SSR
const TripMapInteractiveComponent = lazy(() => import('./TripMapInteractive'));

const MapLoadingFallback = () => (
  <Card className="h-96 bg-gradient-to-br from-purple-100 to-orange-100 border-2 border-dashed border-purple-300">
    <CardContent className="h-full flex items-center justify-center">
      <div className="text-center">
        <MapPin size={48} className="mx-auto text-purple-600 mb-4 animate-pulse" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Cargando Mapa Interactivo...</h3>
        <p className="text-gray-600">Preparando vista de tus viajes</p>
      </div>
    </CardContent>
  </Card>
);

interface TripMapWrapperProps {
  trips: any[];
}

const TripMapWrapper = ({ trips }: TripMapWrapperProps) => {
  const [mapError, setMapError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Fallback timer - si el mapa no carga en 15 segundos, mostrar el fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  // Si hay error o timeout, mostrar el fallback
  if (showFallback || mapError) {
    return <TripMapFallback trips={trips} />;
  }

  return (
    <ClientOnly fallback={<MapLoadingFallback />}>
      <Suspense fallback={<MapLoadingFallback />}>
        <TripMapInteractiveComponent 
          trips={trips} 
          onError={() => setMapError(true)}
        />
      </Suspense>
    </ClientOnly>
  );
};

export default TripMapWrapper;
