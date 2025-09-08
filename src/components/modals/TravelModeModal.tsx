import { BarChart3, Route, X } from "lucide-react";
import React from "react";
import { TravelMode } from "../travel/TravelMode";
import { TravelStats } from "../travel/TravelStats";
import { Card, CardContent } from "../ui/card";
import { Dialog, DialogContent } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useI18n } from "../../hooks/useI18n";

interface TravelModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TravelModeModal: React.FC<TravelModeModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { t } = useI18n();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full mx-4 p-0 gap-0 rounded-xl overflow-hidden max-h-[90vh]">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold">🚗 Modo Travel</h2>
            <p className="text-blue-100 text-sm">
              Monitoreo inteligente de ubicación y lugares guardados
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="travel-mode" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-gray-50">
              <TabsTrigger
                value="travel-mode"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              >
                <Route className="w-4 h-4" />
                {t("home.travelMode.tabTravelMode")}
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
              >
                <BarChart3 className="w-4 h-4" />
                {t("home.travelMode.tabStatistics")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="travel-mode" className="p-4 space-y-4 mt-0">
              <TravelMode className="space-y-4" />
            </TabsContent>

            <TabsContent value="stats" className="p-4 space-y-4 mt-0">
              <TravelStats className="space-y-4" />
            </TabsContent>
          </Tabs>

          {/* Privacy Notice */}
          <div className="p-4 border-t bg-gray-50">
            <Card className="bg-gray-100 border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    🔒
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">
                      {t("home.travelMode.privacyTitle")}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {t("home.travelMode.privacyDescription")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};