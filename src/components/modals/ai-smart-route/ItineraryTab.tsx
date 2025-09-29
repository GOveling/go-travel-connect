import React from "react";
import { Calendar, Clock, Navigation, Star, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DayItinerary, RouteConfiguration } from "@/types/aiSmartRoute";
import { getPriorityColor } from "@/utils/aiSmartRoute";
import TransferBlock from "./TransferBlock";
import FreeTimeBlock from "./FreeTimeBlock";
import AccommodationBase from "./AccommodationBase";
import OptimizationMetrics from "./OptimizationMetrics";
import RouteSegment from "@/components/ui/RouteSegment";
import type { OptimizationMetrics as OptimizationMetricsType } from "@/types/aiSmartRouteApi";
import ItineraryTabTimeline from "./ItineraryTabTimeline";

interface ItineraryTabProps {
  optimizedItinerary: DayItinerary[];
  selectedRouteType: string;
  routeConfigurations: { [key: string]: RouteConfiguration };
  totalSavedPlaces: number;
  totalTripDays: number;
  onRouteTypeChange: (routeType: string) => void;
  optimizationMetrics?: OptimizationMetricsType | null;
  apiRecommendations?: string[];
}

const ItineraryTab = ({
  optimizedItinerary,
  selectedRouteType,
  routeConfigurations,
  totalSavedPlaces,
  totalTripDays,
  onRouteTypeChange,
  optimizationMetrics,
  apiRecommendations = [],
}: ItineraryTabProps) => {
  return (
    <ItineraryTabTimeline
      optimizedItinerary={optimizedItinerary}
      selectedRouteType={selectedRouteType}
      routeConfigurations={routeConfigurations}
      totalSavedPlaces={totalSavedPlaces}
      totalTripDays={totalTripDays}
      onRouteTypeChange={onRouteTypeChange}
      optimizationMetrics={optimizationMetrics}
      apiRecommendations={apiRecommendations}
    />
  );
};

export default ItineraryTab;