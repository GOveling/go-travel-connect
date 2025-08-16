import {
  ArrowLeft,
  Bell,
  Info,
  MapPin,
  Navigation,
  Settings,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";
import { useTravelMode } from "../../hooks/useTravelMode";
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
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";

interface TravelModeProps {
  className?: string;
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
    toggleTravelMode,
    updateConfig,
    getCurrentLocation,
  } = useTravelMode();

  const formatDistance = (distance: number): string => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${Math.round(distance)} m`;
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
              <p className="text-xs text-blue-600 mt-1">
                {t("home.travelMode.accuracy")}: ±
                {Math.round(currentPosition.coords.accuracy)}m
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            {t("home.travelMode.configuration")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Proximity Radius */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium">
                {t("home.travelMode.proximityRadius")}
              </label>
              <span className="text-sm text-gray-600">
                {formatDistance(config.proximityRadius)}
              </span>
            </div>
            <Slider
              value={[config.proximityRadius]}
              onValueChange={([value]) =>
                updateConfig({ proximityRadius: value })
              }
              min={500}
              max={5000}
              step={100}
              className="w-full"
            />
            <p className="text-xs text-gray-600">
              {t("home.travelMode.maxDistance")}
            </p>
          </div>

          <Separator />

          {/* Check Interval */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium">
                {t("home.travelMode.checkInterval")}
              </label>
              <span className="text-sm text-gray-600">
                {config.checkInterval / 1000}s
              </span>
            </div>
            <Slider
              value={[config.checkInterval]}
              onValueChange={([value]) =>
                updateConfig({ checkInterval: value })
              }
              min={10000}
              max={60000}
              step={5000}
              className="w-full"
            />
            <p className="text-xs text-gray-600">
              {t("home.travelMode.checkIntervalDescription")}
            </p>
          </div>

          <Separator />

          {/* Notification Thresholds */}
          <div className="space-y-3">
            <label className="font-medium">Distancias de Notificación</label>
            <div className="flex gap-2 flex-wrap">
              {config.notificationThresholds.map((threshold, index) => (
                <Badge key={index} variant="secondary">
                  {formatDistance(threshold)}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              Recibirás notificaciones a estas distancias
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Places Card */}
      {nearbyPlaces.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Lugares Cercanos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearbyPlaces.slice(0, 5).map((place) => (
                <div
                  key={place.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
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
                  Y {nearbyPlaces.length - 5} lugares más...
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
    </div>
  );
};
