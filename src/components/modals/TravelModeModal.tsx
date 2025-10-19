import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import TravelModeWrapper from "@/components/travel/TravelModeWrapper";
import { DirectionalGuidance } from "@/components/travel/DirectionalGuidance";
import TravelModeMap from "@/components/maps/TravelModeMap";
import { useI18n } from "@/hooks/useI18n";
import { useTravelModeContext } from "@/contexts/TravelModeContext";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TravelModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TravelModeModal = ({ isOpen, onClose }: TravelModeModalProps) => {
  const { t } = useI18n();
  const { currentPosition, nearbyPlaces, isTracking } = useTravelModeContext();
  
  // Find the closest place for directional guidance
  const closestPlace = nearbyPlaces.length > 0 
    ? nearbyPlaces.reduce((closest, current) => 
        current.distance < closest.distance ? current : closest
      )
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Custom Header */}
        <DialogHeader className="sticky top-0 bg-background border-b px-6 py-4">
          <DialogTitle className="text-xl font-semibold">
            🧭 Travel Mode
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Directional Guidance */}
          {closestPlace && closestPlace.distance < 150 && (
            <DirectionalGuidance 
              userLocation={currentPosition}
              targetPlace={closestPlace}
              isEnabled={isTracking}
            />
          )}

          {/* Travel Mode Map */}
          {isTracking && (
            <TravelModeMap
              currentPosition={currentPosition}
              nearbyPlaces={nearbyPlaces}
              className="mb-6"
            />
          )}

          {/* Main Travel Mode Component - Only render when modal is open */}
          {isOpen && <TravelModeWrapper />}

          {/* Privacy Notice */}
          <Card className="bg-muted/50 border-muted">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  🔒
                </div>
                <div>
                  <h4 className="font-medium mb-2">
                    {t("home.travelMode.privacyTitle")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("home.travelMode.privacyDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TravelModeModal;