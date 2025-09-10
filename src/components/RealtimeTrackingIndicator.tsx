import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, Clock, X, AlertTriangle } from "lucide-react";

interface RealtimeTrackingIndicatorProps {
  isTracking: boolean;
  lastUpdate: Date | null;
  trackingError: string | null;
  onStop: () => void;
}

export const RealtimeTrackingIndicator = ({
  isTracking,
  lastUpdate,
  trackingError,
  onStop,
}: RealtimeTrackingIndicatorProps) => {
  if (!isTracking) return null;

  const getLastUpdateText = () => {
    if (!lastUpdate) return "Iniciando...";
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `Hace ${diffSeconds}s`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    return `Hace ${diffMinutes}m`;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <Radio className="h-4 w-4 text-green-600" />
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              GPS continuo activo
            </span>
            {trackingError && (
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-300">
            <Clock className="h-3 w-3" />
            <span>
              {trackingError ? trackingError : `Última actualización: ${getLastUpdateText()}`}
            </span>
          </div>
        </div>
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={onStop}
        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
      >
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
};