import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, TestTube } from "lucide-react";
import { useState } from "react";
import { TravelModeModal } from "@/components/modals/TravelModeModal";

export const TravelModeQuickAccess = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <MapPin className="w-5 h-5" />
          🚗 Modo Travel
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            Nuevo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-blue-700">
          Detecta automáticamente cuando te acercas a lugares guardados y recibe
          notificaciones inteligentes.
        </p>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Navigation className="w-4 h-4" />
            Activar Modo Travel
          </Button>

          <Button
            onClick={() => console.log("Debug mode not available in modal")}
            variant="outline"
            className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            size="sm"
            disabled
          >
            <TestTube className="w-4 h-4" />
            Debug
          </Button>
        </div>

        <div className="flex flex-wrap gap-1 text-xs text-blue-600">
          <span>📍 Geolocalización</span>
          <span>•</span>
          <span>🔔 Notificaciones</span>
          <span>•</span>
          <span>📊 Estadísticas</span>
        </div>
      </CardContent>

      <TravelModeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </Card>
  );
};
