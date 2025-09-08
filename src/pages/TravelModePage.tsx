import { BarChart3, Route } from "lucide-react";
import React from "react";
import { TravelMode } from "../components/travel/TravelMode";
import { TravelStats } from "../components/travel/TravelStats";
import { Card, CardContent } from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useI18n } from "../hooks/useI18n";

const TravelModePage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Main Content with Tabs */}
        <Tabs defaultValue="travel-mode" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
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

          <TabsContent value="travel-mode" className="mt-6">
            <TravelMode />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <TravelStats />
          </TabsContent>
        </Tabs>

        {/* Privacy Notice */}
        <Card className="bg-gray-100 border-gray-200">
          <CardContent className="pt-6">
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
    </div>
  );
};

export default TravelModePage;
