import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";

interface AIRecommendationCardProps {
  tripType: "round-trip" | "one-way" | "multi-city" | "manual";
  multiCityFlights: any[];
}

const AIRecommendationCard = ({
  tripType,
  multiCityFlights,
}: AIRecommendationCardProps) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">
            IA Optimizó tu Vuelo
          </span>
        </div>
        <p className="text-sm text-blue-700">
          Las fechas de vuelo han sido optimizadas automáticamente basándose en
          la distancia y logística de viaje para maximizar tu experiencia.
          {tripType === "multi-city" && multiCityFlights.length > 2 && (
            <span className="block mt-1 font-medium">
              ✈️ Incluye vuelo de retorno al origen
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
};

export default AIRecommendationCard;
