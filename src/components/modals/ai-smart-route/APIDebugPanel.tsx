import { useState } from "react";
import { ChevronDown, ChevronRight, Bug, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SavedPlace } from "@/types/aiSmartRoute";

interface APIDebugInfo {
  sentPlaces: Array<{
    name: string;
    lat: number;
    lon: number;
    type: string;
    priority: number;
  }>;
  receivedPlaces: Array<{
    name: string;
    lat: number;
    lng: number;
    category: string;
    priority: string;
  }>;
  excludedPlaces: SavedPlace[];
  apiResponse: any;
  requestParams: any;
  error?: string;
}

interface APIDebugPanelProps {
  debugInfo?: APIDebugInfo;
  isVisible: boolean;
  onToggle: () => void;
}

const APIDebugPanel = ({ debugInfo, isVisible, onToggle }: APIDebugPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!debugInfo) return null;

  const sentCount = debugInfo.sentPlaces.length;
  const receivedCount = debugInfo.receivedPlaces.length;
  const excludedCount = debugInfo.excludedPlaces.length;

  return (
    <Card className="border-dashed border-muted-foreground/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug API - Lugares Procesados
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-xs"
          >
            {isVisible ? 'Ocultar' : 'Mostrar'} Debug
          </Button>
        </div>
      </CardHeader>

      {isVisible && (
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Badge variant="secondary" className="text-xs">
                Enviados: {sentCount}
              </Badge>
            </div>
            <div>
              <Badge 
                variant={receivedCount === sentCount ? "default" : "destructive"}
                className="text-xs"
              >
                Recibidos: {receivedCount}
              </Badge>
            </div>
            <div>
              <Badge 
                variant={excludedCount > 0 ? "destructive" : "secondary"}
                className="text-xs"
              >
                Excluidos: {excludedCount}
              </Badge>
            </div>
          </div>

          {/* Warning if places were excluded */}
          {excludedCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-xs text-destructive-foreground">
                <p className="font-medium">⚠️ Algunos lugares no fueron incluidos en la ruta:</p>
                <ul className="mt-1 space-y-1">
                  {debugInfo.excludedPlaces.map((place, index) => (
                    <li key={index} className="text-xs">
                      • {place.name} ({place.destinationName})
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs opacity-80">
                  Esto puede deberse a distancias muy largas, dispersión geográfica 
                  o limitaciones del modo de transporte seleccionado.
                </p>
              </div>
            </div>
          )}

          {/* Detailed breakdown */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Ver detalles técnicos
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 mt-2">
              {/* Sent Places */}
              <div>
                <p className="text-xs font-medium mb-2">Lugares enviados a la API:</p>
                <div className="bg-muted/30 p-2 rounded text-xs max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(debugInfo.sentPlaces, null, 2)}
                  </pre>
                </div>
              </div>

              {/* API Response Summary */}
              <div>
                <p className="text-xs font-medium mb-2">Resumen de respuesta API:</p>
                <div className="bg-muted/30 p-2 rounded text-xs">
                  <p>• Total días: {debugInfo.apiResponse?.itinerary?.length || 0}</p>
                  <p>• Lugares únicos: {receivedCount}</p>
                  <p>• Modo transporte: {debugInfo.requestParams?.transport_mode || 'N/A'}</p>
                  <p>• Fechas: {debugInfo.requestParams?.start_date} → {debugInfo.requestParams?.end_date}</p>
                  {debugInfo.apiResponse?.optimization_metrics && (
                    <>
                      <p>• Eficiencia: {Math.round(debugInfo.apiResponse.optimization_metrics.efficiency_score * 100)}%</p>
                      <p>• Fallback activo: {debugInfo.apiResponse.optimization_metrics.fallback_active ? 'Sí' : 'No'}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Error info */}
              {debugInfo.error && (
                <div>
                  <p className="text-xs font-medium mb-2 text-destructive">Error:</p>
                  <div className="bg-destructive/5 border border-destructive/20 p-2 rounded text-xs">
                    {debugInfo.error}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}
    </Card>
  );
};

export default APIDebugPanel;