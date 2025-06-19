
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles } from "lucide-react";

interface AIRecommendationBannerProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city' | 'manual';
  multiCityFlights: any[];
}

const AIRecommendationBanner = ({ tripType, multiCityFlights }: AIRecommendationBannerProps) => {
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Brain size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-blue-800 text-sm">IA Optimizó tu Vuelo</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                <Sparkles size={10} className="mr-1" />
                Optimizado
              </Badge>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              Las fechas han sido optimizadas automáticamente basándose en la distancia 
              y logística de viaje para maximizar tu experiencia.
              {tripType === 'multi-city' && multiCityFlights.length > 2 && (
                <span className="block mt-1 font-medium">
                  ✈️ Incluye vuelo de retorno al origen
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendationBanner;
