import { useGovelingML } from "@/hooks/useGovelingML";
import { GovelingMLService } from "../../services/govelingML";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/types";

// Ejemplo de cómo usar la integración en cualquier componente
export const ExampleGovelingMLUsage = () => {
  const {
    isLoading,
    isHealthChecking,
    lastResponse,
    lastError,
    generateItinerary,
    checkApiHealth,
    clearError,
    transformToInternalFormat,
  } = useGovelingML({
    onSuccess: (response) => {
      console.log("🎉 Itinerario generado exitosamente:", response);
      // Aquí puedes manejar la respuesta exitosa
    },
    onError: (error) => {
      console.error("❌ Error generando itinerario:", error);
      // Aquí puedes manejar errores
    },
  });

  // Ejemplo de trip con lugares guardados
  const exampleTrip: Trip = {
    id: "example-trip",
    name: "Mi Viaje a Santiago",
    destination: "Santiago, Chile",
    startDate: new Date("2024-03-15"),
    endDate: new Date("2024-03-17"),
    status: "planning",
    travelers: 2,
    image: "/placeholder.svg",
    isGroupTrip: false,
    coordinates: [
      {
        name: "Santiago Centro",
        lat: -33.4489,
        lng: -70.6693,
      },
    ],
    savedPlaces: [
      {
        id: "1",
        name: "Cerro San Cristóbal",
        category: "park",
        rating: 4.5,
        image: "/placeholder.svg",
        description: "Hermosa vista panorámica de Santiago",
        estimatedTime: "3h",
        priority: "high",
        destinationName: "Santiago Centro",
        lat: -33.4255,
        lng: -70.6344,
        formattedAddress: "Cerro San Cristóbal, Santiago, Chile",
      },
      {
        id: "2",
        name: "La Moneda",
        category: "museum",
        rating: 4.2,
        image: "/placeholder.svg",
        description: "Palacio presidencial de Chile",
        estimatedTime: "2h",
        priority: "high",
        destinationName: "Santiago Centro",
        lat: -33.4429,
        lng: -70.6544,
        formattedAddress: "Palacio de La Moneda, Santiago, Chile",
      },
      {
        id: "3",
        name: "Mercado Central",
        category: "restaurant",
        rating: 4.0,
        image: "/placeholder.svg",
        description: "Mercado histórico con mariscos frescos",
        estimatedTime: "1.5h",
        priority: "medium",
        destinationName: "Santiago Centro",
        lat: -33.4372,
        lng: -70.6506,
        formattedAddress: "Mercado Central, Santiago, Chile",
      },
      {
        id: "4",
        name: "Hotel Plaza San Francisco",
        category: "lodging",
        rating: 4.3,
        image: "/placeholder.svg",
        description: "Hotel céntrico de lujo",
        estimatedTime: "0h",
        priority: "high",
        destinationName: "Santiago Centro",
        lat: -33.4378,
        lng: -70.6492,
        formattedAddress: "Hotel Plaza San Francisco, Santiago, Chile",
      },
    ],
  };

  const handleGenerateItinerary = async () => {
    const preferences = {
      start_time: "09:00",
      end_time: "18:00",
      max_daily_activities: 5,
      preferred_transport: "walking" as const,
    };

    // Log what will be sent to the API
    console.log("=== DEBUGGING: Payload that will be sent ===");
    const testPayload = GovelingMLService.transformTripToGovelingML(exampleTrip, preferences);
    console.log(JSON.stringify(testPayload, null, 2));
    
    const response = await generateItinerary(exampleTrip, preferences);
    
    if (response) {
      // Transformar a formato interno si es necesario
      const internalFormat = transformToInternalFormat(response, exampleTrip);
      console.log("Formato interno:", internalFormat);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Ejemplo de Integración Goveling ML</h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <Button
            onClick={checkApiHealth}
            disabled={isHealthChecking}
            variant="outline"
          >
            {isHealthChecking ? "Verificando..." : "Test API Health"}
          </Button>
          
          <Button
            onClick={handleGenerateItinerary}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {isLoading ? "Generando..." : "🧠 Generar Itinerario ML"}
          </Button>
          
          {lastError && (
            <Button
              onClick={clearError}
              variant="outline"
              size="sm"
            >
              Clear Error
            </Button>
          )}
        </div>

        {/* Estado de la API */}
        <div className="text-sm">
          <div className="font-medium mb-2">Estado Actual:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Cargando: {isLoading ? "Sí" : "No"}</li>
            <li>Verificando salud: {isHealthChecking ? "Sí" : "No"}</li>
            <li>Última respuesta: {lastResponse ? "Disponible" : "No disponible"}</li>
            <li>Último error: {lastError ? lastError.message : "Ninguno"}</li>
          </ul>
        </div>

        {/* Última respuesta */}
        {lastResponse && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">✅ Última Respuesta Exitosa</h3>
            <div className="text-sm text-green-700 space-y-1">
              <div>Actividades: {lastResponse.analytics.total_activities}</div>
              <div>Días: {lastResponse.analytics.total_days}</div>
              <div>Eficiencia: {lastResponse.analytics.optimization_efficiency.toFixed(1)}%</div>
              <div>Modo: {lastResponse.analytics.optimization_mode}</div>
              <div>Tiempo de generación: {lastResponse.metadata.generation_time}s</div>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Ver itinerario completo</summary>
                <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto max-h-60">
                  {JSON.stringify(lastResponse.itinerary, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        {/* Último error */}
        {lastError && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">❌ Último Error</h3>
            <div className="text-sm text-red-700 space-y-1">
              <div>Código: {lastError.statusCode}</div>
              <div>Mensaje: {lastError.message}</div>
              {lastError.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Ver detalles</summary>
                  <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto max-h-40">
                    {JSON.stringify(lastError.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Trip de ejemplo */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">📊 Trip de Ejemplo</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>Nombre: {exampleTrip.name}</div>
            <div>Destino: {exampleTrip.destination}</div>
            <div>Lugares guardados: {exampleTrip.savedPlaces?.length || 0}</div>
            <div>Fechas: {exampleTrip.startDate?.toLocaleDateString()} - {exampleTrip.endDate?.toLocaleDateString()}</div>
            
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Ver lugares</summary>
              <ul className="text-xs mt-2 space-y-1">
                {exampleTrip.savedPlaces?.map((place) => (
                  <li key={place.id} className="flex justify-between">
                    <span>{place.name}</span>
                    <span className="text-blue-500">({place.category}, {place.priority})</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};
