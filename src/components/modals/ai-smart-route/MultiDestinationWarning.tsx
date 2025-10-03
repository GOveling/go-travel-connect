import { AlertTriangle, MapPin, Car, Train, Plane } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiDestinationAnalysis } from "@/utils/multiDestinationUtils";
interface MultiDestinationWarningProps {
  analysis: MultiDestinationAnalysis;
  onTransportModeChange: (mode: 'walk' | 'drive' | 'transit' | 'bike') => void;
  currentTransportMode: string;
}
const MultiDestinationWarning = ({
  analysis,
  onTransportModeChange,
  currentTransportMode
}: MultiDestinationWarningProps) => {
  if (!analysis.isMultiDestination) return null;
  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'drive':
        return <Car className="h-4 w-4" />;
      case 'transit':
        return <Train className="h-4 w-4" />;
      case 'bike':
        return <MapPin className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };
  const getTransportLabel = (mode: string) => {
    switch (mode) {
      case 'drive':
        return 'Auto';
      case 'transit':
        return 'Transporte Público';
      case 'bike':
        return 'Bicicleta';
      case 'walk':
        return 'Caminando';
      default:
        return mode;
    }
  };
  return;
};
export default MultiDestinationWarning;