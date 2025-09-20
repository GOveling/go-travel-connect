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
      case 'drive': return <Car className="h-4 w-4" />;
      case 'transit': return <Train className="h-4 w-4" />;
      case 'bike': return <MapPin className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getTransportLabel = (mode: string) => {
    switch (mode) {
      case 'drive': return 'Auto';
      case 'transit': return 'Transporte Público';
      case 'bike': return 'Bicicleta';
      case 'walk': return 'Caminando';
      default: return mode;
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="border-warning bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-warning-foreground">
          <div className="space-y-2">
            <p className="font-medium">Viaje Multi-Destino Detectado</p>
            <p className="text-sm">
              Tu viaje incluye lugares en {analysis.groups.length} regiones diferentes 
              con una distancia máxima de {Math.round(analysis.maxDistanceKm)}km.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Destinos por Región
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.groups.map((group, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{group.region}</p>
                <p className="text-xs text-muted-foreground">{group.country}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {group.places.length} lugares
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Modo de Transporte Recomendado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {['walk', 'bike', 'transit', 'drive'].map((mode) => (
              <Button
                key={mode}
                variant={mode === analysis.recommendedTransportMode ? "default" : 
                        mode === currentTransportMode ? "secondary" : "outline"}
                size="sm"
                onClick={() => onTransportModeChange(mode as any)}
                className="flex items-center gap-2 text-xs"
              >
                {getTransportIcon(mode)}
                {getTransportLabel(mode)}
              </Button>
            ))}
          </div>
          
          {analysis.recommendedTransportMode !== currentTransportMode && (
            <p className="text-xs text-muted-foreground mt-2">
              💡 Recomendado: {getTransportLabel(analysis.recommendedTransportMode)} 
              para distancias de {Math.round(analysis.maxDistanceKm)}km
            </p>
          )}
        </CardContent>
      </Card>

      {analysis.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sugerencias</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiDestinationWarning;