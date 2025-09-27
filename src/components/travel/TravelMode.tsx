import {
  ArrowLeft,
  Bell,
  Info,
  MapPin,
  Navigation,
  Settings,
  Activity,
  Zap,
  Smartphone,
  Globe,
  ChevronDown,
  ChevronUp,
  Signal,
  Cpu,
} from "lucide-react";
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";
import { useTravelModeContext } from "../../contexts/TravelModeContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

interface TravelModeProps {
  className?: string;
}

interface DebugMetrics {
  lastUpdate: Date | null;
  updateCount: number;
  averageAccuracy: number;
  platformType: 'native' | 'web';
  energyMode: string;
  currentInterval: number;
  nearbyPlacesCount: number;
  closestDistance: number;
  renderCount: number;
}

export const TravelMode: React.FC<TravelModeProps> = ({ className }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const {
    config,
    currentPosition,
    nearbyPlaces,
    isTracking,
    loading,
    status,
    currentSpeed,
    energyMode,
    currentActivity,
    activitySupported,
    toggleTravelMode,
    checkProximity,
    checkLocationPermissions,
    checkNotificationPermissions,
    getActiveTripToday,
  } = useTravelModeContext();

  // UI State
  const [debugExpanded, setDebugExpanded] = React.useState(false);
  const renderCountRef = useRef(0);
  
  // Track component re-renders without causing infinite loops
  renderCountRef.current += 1;
  console.log(`🎨 TravelMode component re-rendered (#${renderCountRef.current})`);

  // Memoized debug metrics calculation
  const debugMetrics = useMemo(() => {
    const closestDistance = nearbyPlaces.length > 0 
      ? Math.min(...nearbyPlaces.map(p => p.distance))
      : 0;

    return {
      lastUpdate: currentPosition ? new Date() : null,
      updateCount: renderCountRef.current,
      averageAccuracy: currentPosition?.coords?.accuracy || 0,
      platformType: (typeof window !== 'undefined' && 'Capacitor' in window ? 'native' : 'web') as 'native' | 'web',
      energyMode: energyMode || 'normal',
      currentInterval: closestDistance > 0 ? (closestDistance <= 60 ? 1 : closestDistance <= 100 ? 1.5 : closestDistance <= 200 ? 2.5 : 5) : 0,
      nearbyPlacesCount: nearbyPlaces.length,
      closestDistance: closestDistance,
      renderCount: renderCountRef.current
    };
  }, [currentPosition, energyMode, nearbyPlaces]);

  // Log significant changes only when they actually happen
  const prevMetricsRef = useRef<DebugMetrics | null>(null);
  useEffect(() => {
    if (prevMetricsRef.current) {
      const prev = prevMetricsRef.current;
      if (prev.nearbyPlacesCount !== debugMetrics.nearbyPlacesCount || 
          Math.abs(prev.closestDistance - debugMetrics.closestDistance) > 10) {
        console.log(`📊 TravelMode metrics updated:`, {
          places: debugMetrics.nearbyPlacesCount,
          closest: `${debugMetrics.closestDistance.toFixed(0)}m`,
          expectedInterval: `${debugMetrics.currentInterval}s`,
          lastUpdate: debugMetrics.lastUpdate?.toLocaleTimeString()
        });
      }
    }
    prevMetricsRef.current = debugMetrics;
  }, [debugMetrics]);

  // Función temporal para obtener ubicación actual
  const getCurrentLocation = () => {
    checkProximity();
  };

  const formatDistance = (distance: number): string => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${Math.round(distance)} m`;
  };

  const formatSpeed = (speedMs: number): string => {
    const speedKmh = speedMs * 3.6;
    if (speedKmh < 0.5) return "Estático";
    if (speedKmh < 7) return `${speedKmh.toFixed(1)} km/h (Caminando)`;
    if (speedKmh < 25) return `${speedKmh.toFixed(1)} km/h (Ciclismo)`;
    return `${speedKmh.toFixed(1)} km/h (Conduciendo)`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGpsStatusColor = (accuracy: number) => {
    if (accuracy <= 10) return "bg-green-500"; // Excellent
    if (accuracy <= 30) return "bg-yellow-500"; // Good
    return "bg-red-500"; // Poor
  };

  const getGpsStatusText = (accuracy: number) => {
    if (accuracy <= 10) return "Excelente";
    if (accuracy <= 30) return "Buena";
    return "Pobre";
  };

  const getPlatformIcon = () => {
    return debugMetrics.platformType === 'native' ? <Smartphone className="w-4 h-4" /> : <Globe className="w-4 h-4" />;
  };

  const getEnergyModeColor = (mode: string) => {
    switch (mode) {
      case 'normal': return "text-green-600";
      case 'saving': return "text-yellow-600";
      case 'ultra-saving': return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Card with integrated header and controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                <span>{t("home.travelMode.title")}</span>
              </div>
            </div>

            {/* Info Modal Trigger */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Info className="w-4 h-4 text-gray-600" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    {t("home.travelMode.infoModalTitle")}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Beta Function Warning */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">
                          {t("home.travelMode.betaFunction")}
                        </h4>
                        <p className="text-sm text-yellow-800 mb-2">
                          {t("home.travelMode.betaWarning")}
                        </p>
                        <p className="text-xs text-yellow-700">
                          {t("home.travelMode.betaDescription")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* How it works */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-blue-600" />
                      {t("home.travelMode.howItWorks")}
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          1
                        </span>
                        <span>{t("home.travelMode.infoSteps.step1")}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          2
                        </span>
                        <span>{t("home.travelMode.infoSteps.step2")}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          3
                        </span>
                        <span>{t("home.travelMode.infoSteps.step3")}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          4
                        </span>
                        <span>{t("home.travelMode.infoSteps.step4")}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Additional Tips */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">
                          {t("home.travelMode.usageTips")}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-blue-900 mb-1">
                              {t("home.travelMode.optimizationTips")}:
                            </h5>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• {t("home.travelMode.tips.tip1")}</li>
                              <li>• {t("home.travelMode.tips.tip2")}</li>
                              <li>• {t("home.travelMode.tips.tip3")}</li>
                              <li>• {t("home.travelMode.tips.tip4")}</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-blue-900 mb-1">
                              {t("home.travelMode.batteryTips")}:
                            </h5>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• {t("home.travelMode.tips.tip5")}</li>
                              <li>• {t("home.travelMode.tips.tip6")}</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-blue-900 mb-1">
                              {t("home.travelMode.bestPracticesTips")}:
                            </h5>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• {t("home.travelMode.tips.tip7")}</li>
                              <li>• {t("home.travelMode.tips.tip8")}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Controls */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">
                {config.isEnabled
                  ? t("home.travelMode.enabled")
                  : t("home.travelMode.disabled")}
              </p>
              <p className="text-sm text-gray-600">
                {config.isEnabled
                  ? t("home.travelMode.monitoring")
                  : t("home.travelMode.enableTravelMode")}
              </p>
            </div>
            <Switch
              checked={config.isEnabled}
              onCheckedChange={() => toggleTravelMode()}
              disabled={loading}
            />
          </div>

          {/* Current Location */}
          {currentPosition && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {t("home.travelMode.currentLocation")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={getCurrentLocation}
                  className="text-blue-600"
                >
                  {t("home.travelMode.update")}
                </Button>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Lat: {currentPosition.coords.latitude.toFixed(6)}, Lng:{" "}
                {currentPosition.coords.longitude.toFixed(6)}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-blue-600">
                  {t("home.travelMode.accuracy")}: ±
                  {Math.round(currentPosition.coords.accuracy)}m
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  🏃 {formatSpeed(currentSpeed)} ({(currentSpeed * 3.6).toFixed(1)} km/h)
                </p>
                {activitySupported && currentActivity && (
                  <p className="text-xs text-green-600 font-medium">
                    🎯 {currentActivity.activity} ({Math.round(currentActivity.confidence * 100)}%)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Debug Panel */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setDebugExpanded(!debugExpanded)}
            >
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Sistema y Debug
              </h4>
              {debugExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            
            {/* Quick Status Row */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.hasLocationPermission ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Ubicación</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.hasNotificationPermission ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>Notificaciones</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.hasActiveTrip ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Viaje activo</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.isLocationAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>GPS disponible</span>
              </div>
            </div>

            {/* Expanded Debug Information */}
            {debugExpanded && (
              <div className="space-y-4 pt-3 border-t border-gray-200">
                {/* Platform and Energy Mode */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    {getPlatformIcon()}
                    <span className="font-medium">Plataforma:</span>
                    <span className="text-blue-600">{debugMetrics.platformType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Energía:</span>
                    <span className={getEnergyModeColor(debugMetrics.energyMode)}>
                      {debugMetrics.energyMode}
                    </span>
                  </div>
                </div>

                {/* GPS Performance Metrics */}
                {currentPosition && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-800 flex items-center gap-2">
                      <Signal className="w-4 h-4" />
                      GPS Performance
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getGpsStatusColor(currentPosition.coords.accuracy)}`}></div>
                        <span>Precisión: {Math.round(currentPosition.coords.accuracy)}m ({getGpsStatusText(currentPosition.coords.accuracy)})</span>
                      </div>
                      <div className="text-gray-600">
                        Promedio: {Math.round(debugMetrics.averageAccuracy)}m
                      </div>
                      <div className="text-gray-600">
                        Última actualización: {debugMetrics.lastUpdate?.toLocaleTimeString() || 'N/A'}
                      </div>
                      <div className="text-gray-600">
                        Total actualizaciones: {debugMetrics.updateCount}
                      </div>
                      <div className="text-gray-600">
                        Re-renders: {debugMetrics.renderCount}
                      </div>
                      <div className="text-gray-600">
                        Intervalo esperado: ~{debugMetrics.currentInterval}s
                      </div>
                    </div>
                  </div>
                )}

                 {/* Real-time Proximity Metrics */}
                 <div className="space-y-2">
                   <h5 className="font-medium text-gray-800 flex items-center gap-2">
                     <MapPin className="w-4 h-4" />
                     Métricas de Proximidad
                   </h5>
                   <div className="grid grid-cols-2 gap-3 text-sm">
                     <div className="text-gray-600">
                       Lugares cercanos: {debugMetrics.nearbyPlacesCount}
                     </div>
                     <div className="text-gray-600">
                       Distancia mínima: {debugMetrics.closestDistance > 0 ? `${debugMetrics.closestDistance.toFixed(0)}m` : 'N/A'}
                     </div>
                   </div>
                 </div>

                 {/* Activity Recognition */}
                {activitySupported && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-800 flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      Reconocimiento de Actividad
                    </h5>
                    <div className="text-sm">
                      {currentActivity ? (
                        <div className="flex items-center gap-4">
                          <span>Actividad: <strong>{currentActivity.activity}</strong></span>
                          <span>Confianza: <strong>{Math.round(currentActivity.confidence * 100)}%</strong></span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Sin datos de actividad</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Speed Analytics */}
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-800 flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Análisis de Velocidad
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>Velocidad actual: <strong>{formatSpeed(currentSpeed)}</strong></div>
                    <div>Km/h: <strong>{(currentSpeed * 3.6).toFixed(1)}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {status.lastError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <strong>Error:</strong> {status.lastError}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={checkLocationPermissions}
                className="text-xs"
              >
                Verificar permisos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                className="text-xs"
              >
                Actualizar ubicación
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Places Card */}
      {nearbyPlaces.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              {t("home.travelMode.nearbyPlaces")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearbyPlaces
                .sort((a, b) => a.distance - b.distance) // Ordenar por distancia (más cercano primero)
                .slice(0, 5)
                .map((place, index) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {/* Número correlativo */}
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{place.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatDistance(place.distance)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(place.priority)}>
                    {place.priority}
                  </Badge>
                </div>
              ))}
              {nearbyPlaces.length > 5 && (
                <p className="text-center text-sm text-gray-500 py-2">
                  {t("home.travelMode.moreNearbyPlaces", {
                    count: nearbyPlaces.length - 5,
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {nearbyPlaces.length === 0 && config.isEnabled && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">
              {t("home.travelMode.noNearbyPlacesTitle")}
            </h3>
            <p className="text-sm text-gray-600">
              {t("home.travelMode.noPlacesFound")}{" "}
              {formatDistance(config.proximityRadius)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* How it Works Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            {t("home.travelMode.howItWorks")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Detection Radius (read-only) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium text-sm">
                {t("home.travelMode.proximityRadius")}
              </label>
              <span className="text-sm text-gray-600">
                {formatDistance(config.proximityRadius)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {t("home.travelMode.maxDistance")}
            </p>
          </div>

          <Separator />

          {/* Notification Thresholds (read-only) */}
          <div className="space-y-2">
            <label className="font-medium text-sm">
              {t("home.travelMode.notificationDistances")}
            </label>
            <div className="flex gap-1 flex-wrap">
              {config.notificationThresholds.map((threshold, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {formatDistance(threshold)}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {t("home.travelMode.progressiveNotifications")}
            </p>
          </div>

          <Separator />

          {/* System Info */}
          <div className="space-y-2">
            <label className="font-medium text-sm">
              {t("home.travelMode.automaticOptimization")}
            </label>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• {t("home.travelMode.dynamicIntervals")}</p>
              <p>• {t("home.travelMode.higherFrequencyNear")}</p>
              <p>• {t("home.travelMode.lowerBatteryFar")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
