import { Activity, Clock, Route, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { OptimizationMetrics } from "@/types/aiSmartRouteApi";

interface OptimizationMetricsProps {
  metrics: OptimizationMetrics;
  recommendations: string[];
}

const OptimizationMetrics = ({ metrics, recommendations }: OptimizationMetricsProps) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyLabel = (score: number) => {
    if (score >= 0.8) return 'Excelente';
    if (score >= 0.6) return 'Buena';
    return 'Mejorable';
  };

  return (
    <div className="space-y-4">
      {metrics.fallback_active && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Optimización limitada. Intenta de nuevo para mejores resultados.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <Activity className="h-4 w-4" />
            <span>Métricas de Optimización</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className={`text-2xl font-bold ${getEfficiencyColor(metrics.efficiency_score)}`}>
                {(metrics.efficiency_score * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-600">Eficiencia</p>
              <Badge className={`text-xs ${getEfficiencyColor(metrics.efficiency_score)}`}>
                {getEfficiencyLabel(metrics.efficiency_score)}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {metrics.total_distance_km.toFixed(1)}km
              </p>
              <p className="text-xs text-gray-600">Distancia total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatTime(metrics.total_travel_time_minutes)}
              </p>
              <p className="text-xs text-gray-600">Tiempo de viaje</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {metrics.processing_time_seconds.toFixed(1)}s
              </p>
              <p className="text-xs text-gray-600">Tiempo de cálculo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tiempo caminando:</span>
              <span className="font-medium">{formatTime(metrics.walking_time_minutes)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tiempo en transporte:</span>
              <span className="font-medium">{formatTime(metrics.transport_time_minutes)}</span>
            </div>
          </div>

          {metrics.intercity_transfers.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 mb-2">
                <Route className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Traslados interurbanos</span>
              </div>
              <div className="space-y-2">
                {metrics.intercity_transfers.map((transfer, index) => (
                  <div key={index} className="bg-orange-50 p-2 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {transfer.from} → {transfer.to}
                      </span>
                      <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                        {transfer.mode}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {transfer.distance_km.toLocaleString()} km • {transfer.estimated_time_hours.toFixed(1)}h
                      {transfer.overnight && <span className="ml-2 text-orange-600">• Nocturno</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium">Modo:</span>
              <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                {metrics.optimization_mode}
              </Badge>
            </div>
            {metrics.hotels_provided && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Alojamientos incluidos:</span>
                <span className="text-sm font-medium">{metrics.hotels_count}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-base">
              <Info className="h-4 w-4" />
              <span>Recomendaciones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptimizationMetrics;