import { MapPin, Loader2, Map } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface NearbyLocationToggleProps {
  isNearbyEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onLocationChange: (location: { lat: number; lng: number } | null) => void;
  onShowMap?: () => void;
  hasResults?: boolean;
}

export const NearbyLocationToggle = ({
  isNearbyEnabled,
  onToggle,
  onLocationChange,
  onShowMap,
  hasResults = false,
}: NearbyLocationToggleProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { location, isLocating, error, getCurrentLocation } = useUserLocation();

  useEffect(() => {
    onLocationChange(location);
  }, [location, onLocationChange]);

  useEffect(() => {
    if (error) {
      toast({
        title: t("explore.nearbyLocation.locationError"),
        description: error,
        variant: "destructive",
      });
      onToggle(false);
    }
  }, [error, onToggle, toast, t]);

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        await getCurrentLocation();
        onToggle(true);
      } catch (err) {
        onToggle(false);
      }
    } else {
      onToggle(false);
      onLocationChange(null);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
          {isLocating ? (
            <Loader2 size={20} className="text-blue-600 animate-spin" />
          ) : (
            <MapPin size={20} className="text-blue-600" />
          )}
        </div>
        <div className="flex flex-col">
          <Label
            htmlFor="nearby-toggle"
            className="text-sm font-semibold text-gray-800 cursor-pointer"
          >
            {t("explore.nearbyLocation.title")}
          </Label>
          <p className="text-xs text-gray-500">
            {t("explore.nearbyLocation.subtitle")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {hasResults && (
          <Button
            size="sm"
            variant="outline"
            onClick={onShowMap}
            className="h-9 px-3"
          >
            <Map size={16} className="mr-1" />
            Mapa
          </Button>
        )}
        <Switch
          id="nearby-toggle"
          checked={isNearbyEnabled}
          onCheckedChange={handleToggle}
          disabled={isLocating}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>
    </div>
  );
};