import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import { TravelMode } from "../travel/TravelMode";
import { TravelStats } from "../travel/TravelStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Route } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Card, CardContent } from "@/components/ui/card";

interface TravelModeModalProps {
  children: React.ReactNode;
}

export const TravelModeModal = ({ children }: TravelModeModalProps) => {
  const { t } = useI18n();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] rounded-3xl border-0 shadow-2xl overflow-hidden bg-white p-0">
        <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <Navigation className="w-6 h-6" />
              <h2 className="text-xl font-bold">{t("home.travelMode.title")}</h2>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              {t("home.travelMode.description")}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <Tabs defaultValue="travel-mode" className="h-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="travel-mode"
                  className="flex items-center gap-2"
                >
                  <Route className="w-4 h-4" />
                  {t("home.travelMode.tabTravelMode")}
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t("home.travelMode.tabStatistics")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="travel-mode" forceMount className="h-full">
                <TravelMode className="h-full" />
              </TabsContent>

              <TabsContent value="stats" forceMount className="h-full">
                <TravelStats />
              </TabsContent>
            </Tabs>
          </div>

          {/* Privacy Notice */}
          <Card className="bg-gray-100 border-gray-200 mx-6 mb-6">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  🔒
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {t("home.travelMode.privacyTitle")}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t("home.travelMode.privacyDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};