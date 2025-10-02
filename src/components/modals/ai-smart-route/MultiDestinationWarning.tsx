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
  return null;
};

export default MultiDestinationWarning;