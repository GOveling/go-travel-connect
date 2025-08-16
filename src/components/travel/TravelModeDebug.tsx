import { MapPin, Play, Square, Target, TestTube } from "lucide-react";
import React, { useState } from "react";
import { useTravelMode } from "../../hooks/useTravelMode";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const TravelModeDebug: React.FC = () => {
  const {
    config,
    currentPosition,
    nearbyPlaces,
    isTracking,
    loading,
    toggleTravelMode,
    updateConfig,
    getCurrentLocation,
    calculateDistance,
  } = useTravelMode();

  const [testLat, setTestLat] = useState("");
  const [testLng, setTestLng] = useState("");

  // Coordenadas de prueba para diferentes ciudades
  const testLocations = [
    { name: "Centro CDMX", lat: 19.4326, lng: -99.1332 },
    { name: "Torre Eiffel", lat: 48.8584, lng: 2.2945 },
    { name: "Times Square", lat: 40.758, lng: -73.9855 },
    { name: "Plaza de Armas, Santiago", lat: -33.4569, lng: -70.6483 },
  ];

  // Simular ubicación (solo para pruebas web)
  const simulateLocation = (lat: number, lng: number) => {
    if (typeof window !== "undefined") {
      // @ts-expect-error - Solo para desarrollo
      window.mockPosition = {
        coords: {
          latitude: lat,
          longitude: lng,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      console.log("🧪 Ubicación simulada:", { lat, lng });
      getCurrentLocation();
    }
  };

  const testDistance = () => {
    if (testLat && testLng && currentPosition) {
      const distance = calculateDistance(
        currentPosition.coords.latitude,
        currentPosition.coords.longitude,
        parseFloat(testLat),
        parseFloat(testLng)
      );

      console.log("📏 Distancia calculada:", distance, "metros");
      alert(
        `Distancia: ${Math.round(distance)} metros (${(distance / 1000).toFixed(2)} km)`
      );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Debug Header */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <TestTube className="w-5 h-5" />
            🧪 Modo Debug - Travel Mode
            <Badge variant="outline" className="bg-yellow-100">
              Desarrollo
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 text-sm">
            Este panel te permite probar el Travel Mode desde el navegador web.
            Para pruebas completas, usa un dispositivo móvil real.
          </p>
        </CardContent>
      </Card>

      {/* Estado Actual */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Modo Activo:</span>
              <Badge variant={config.isEnabled ? "default" : "secondary"}>
                {config.isEnabled ? "SÍ" : "NO"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Tracking GPS:</span>
              <Badge variant={isTracking ? "default" : "secondary"}>
                {isTracking ? "ACTIVO" : "INACTIVO"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Cargando Viajes:</span>
              <Badge variant={loading ? "destructive" : "default"}>
                {loading ? "SÍ" : "NO"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Lugares Cercanos:</span>
              <Badge variant="outline">{nearbyPlaces.length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Radio:</span>
              <span>{config.proximityRadius}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Intervalo:</span>
              <span>{config.checkInterval / 1000}s</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Notificaciones:</span>
              <span>{config.notificationThresholds.join(", ")}m</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Controles de Prueba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={toggleTravelMode}
              variant={isTracking ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isTracking ? (
                <>
                  <Square className="w-4 h-4" />
                  Detener Travel Mode
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Iniciar Travel Mode
                </>
              )}
            </Button>

            <Button onClick={getCurrentLocation} variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              Obtener Ubicación
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ubicación Actual */}
      {currentPosition && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Ubicación Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Latitud</Label>
                <p className="font-mono text-sm">
                  {currentPosition.coords.latitude.toFixed(6)}
                </p>
              </div>
              <div>
                <Label>Longitud</Label>
                <p className="font-mono text-sm">
                  {currentPosition.coords.longitude.toFixed(6)}
                </p>
              </div>
              <div>
                <Label>Precisión</Label>
                <p className="text-sm">
                  ±{Math.round(currentPosition.coords.accuracy)}m
                </p>
              </div>
              <div>
                <Label>Timestamp</Label>
                <p className="text-sm">
                  {new Date(currentPosition.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ubicaciones de Prueba */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Simular Ubicaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Haz clic en una ubicación para simularla (solo funciona en web):
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {testLocations.map((location, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => simulateLocation(location.lat, location.lng)}
                className="text-xs"
              >
                {location.name}
              </Button>
            ))}
          </div>

          <div className="border-t pt-4">
            <Label>Coordenadas Personalizadas</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                placeholder="Latitud"
                value={testLat}
                onChange={(e) => setTestLat(e.target.value)}
                type="number"
                step="any"
              />
              <Input
                placeholder="Longitud"
                value={testLng}
                onChange={(e) => setTestLng(e.target.value)}
                type="number"
                step="any"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                onClick={() => {
                  if (testLat && testLng) {
                    simulateLocation(parseFloat(testLat), parseFloat(testLng));
                  }
                }}
                variant="outline"
                size="sm"
                disabled={!testLat || !testLng}
              >
                Simular Ubicación
              </Button>
              <Button
                onClick={testDistance}
                variant="outline"
                size="sm"
                disabled={!testLat || !testLng || !currentPosition}
              >
                <Target className="w-4 h-4 mr-1" />
                Calcular Distancia
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lugares Cercanos */}
      {nearbyPlaces.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Lugares Cercanos Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearbyPlaces.map((place) => (
                <div
                  key={place.id}
                  className="p-3 border rounded-lg bg-orange-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{place.name}</h4>
                      <p className="text-sm text-gray-600">
                        Viaje: {place.tripName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">
                        {Math.round(place.distance)}m
                      </p>
                      <p className="text-xs text-gray-500">
                        {(place.distance / 1000).toFixed(2)} km
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Abre las DevTools del navegador (F12) y ve a la consola</li>
            <li>Haz clic en "Iniciar Travel Mode" para activar el sistema</li>
            <li>Usa las ubicaciones de prueba para simular movimiento</li>
            <li>Observa los logs en la consola para ver la actividad</li>
            <li>Si tienes lugares guardados en viajes, verás notificaciones</li>
          </ol>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">
              💡 Para pruebas completas con GPS real y notificaciones push:
            </p>
            <p className="text-blue-700 text-sm mt-1">
              1. Ejecuta: <code>npm run build</code>
              <br />
              2. Luego: <code>npx cap sync</code>
              <br />
              3. Y finalmente: <code>npx cap run android</code> o{" "}
              <code>npx cap run ios</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
