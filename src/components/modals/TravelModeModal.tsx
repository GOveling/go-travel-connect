import {
  Bell,
  Info,
  MapPin,
  Navigation,
  Settings,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { useTravelModeContext } from "../../contexts/TravelModeContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

interface TravelModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TravelModeModal: React.FC<TravelModeModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { t } = useLanguage();
  const [showInfo, setShowInfo] = useState(false);
  
  const {
    config,
    currentPosition,
    nearbyPlaces,
    isTracking,
    loading,
    status,
    toggleTravelMode,
    checkProximity,
    checkLocationPermissions,
    checkNotificationPermissions,
    getActiveTripToday,
  } = useTravelModeContext();

  // Función temporal para obtener ubicación actual
  const getCurrentLocation = () => {
    checkProximity();
  };

  const activeTrip = getActiveTripToday();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Navigation className="w-5 h-5 text-blue-600" />
              <span>{t("home.travelMode.title")}</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Beta
              </Badge>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfo(true)}
              className="h-8 w-8 p-0"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Info Modal */}
        <Dialog open={showInfo} onOpenChange={setShowInfo}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t("home.travelMode.infoModalTitle")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Bell className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">
                      {t("home.travelMode.betaFunction")}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      {t("home.travelMode.betaWarning")}
                    </p>
                    <p className="text-sm text-amber-700 mt-2">
                      {t("home.travelMode.betaDescription")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t("home.travelMode.howItWorks")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <span className="text-sm text-gray-600">{t("home.travelMode.infoSteps.step1")}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <span className="text-sm text-gray-600">{t("home.travelMode.infoSteps.step2")}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <span className="text-sm text-gray-600">{t("home.travelMode.infoSteps.step3")}</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">4</span>
                    </div>
                    <span className="text-sm text-gray-600">{t("home.travelMode.infoSteps.step4")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    {t("home.travelMode.usageTips")}
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {t("home.travelMode.optimizationTips")}:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {t("home.travelMode.tips.tip1")}</li>
                      <li>• {t("home.travelMode.tips.tip2")}</li>
                      <li>• {t("home.travelMode.tips.tip3")}</li>
                      <li>• {t("home.travelMode.tips.tip4")}</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {t("home.travelMode.batteryTips")}:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {t("home.travelMode.tips.tip5")}</li>
                      <li>• {t("home.travelMode.tips.tip6")}</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {t("home.travelMode.bestPracticesTips")}:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {t("home.travelMode.tips.tip7")}</li>
                      <li>• {t("home.travelMode.tips.tip8")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {/* Toggle Switch */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">
                    {config.isEnabled
                      ? t("home.travelMode.enabled")
                      : t("home.travelMode.disabled")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isTracking
                      ? t("home.travelMode.monitoring")
                      : t("home.travelMode.enableTravelMode")}
                  </p>
                </div>
                <Switch
                  checked={config.isEnabled}
                  onCheckedChange={() => toggleTravelMode()}
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Location */}
          {config.isEnabled && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t("home.travelMode.currentLocation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={getCurrentLocation}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {t("home.travelMode.update")}
                </Button>
                {currentPosition && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      {t("home.travelMode.accuracy")}: ±
                      {Math.round(currentPosition.accuracy || 0)}m
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t("home.travelMode.systemStatus")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t("home.travelMode.locationPermissions")}
                </span>
                <Button
                  onClick={checkLocationPermissions}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  {t("home.travelMode.check")}
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t("home.travelMode.notificationPermissions")}
                </span>
                <Button
                  onClick={checkNotificationPermissions}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  {t("home.travelMode.check")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Nearby Places */}
          {nearbyPlaces && nearbyPlaces.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("home.travelMode.nearbyPlaces")} ({nearbyPlaces.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {nearbyPlaces.slice(0, 5).map((place, index) => (
                    <div
                      key={place.id || index}
                      className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                    >
                      <span className="truncate">{place.name}</span>
                      <span className="text-xs text-gray-500">
                        {typeof place.distance === 'string' 
                          ? place.distance 
                          : place.distance >= 1000 
                            ? `${(place.distance / 1000).toFixed(1)} km`
                            : `${Math.round(place.distance)} m`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Info */}
          {status && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {t("home.travelMode.systemStatus")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status.hasLocationPermission ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{t("home.travelMode.locationPermissions")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status.hasNotificationPermission ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>{t("home.travelMode.notificationPermissions")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status.hasActiveTrip ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{t("home.currentTrip.currentTrip")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status.isLocationAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>GPS</span>
                </div>
                {status.lastError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <strong>Error:</strong> {status.lastError}
                  </div>
                )}
              </CardContent>
            </Card>
          )}


          {loading && (
            <div className="text-center text-sm text-blue-600">
              {t("common.loading")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};