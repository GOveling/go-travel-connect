import { TrendingUp, Clock, MapPin, Star, Route } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RouteConfiguration } from "@/types/aiSmartRoute";

interface AnalyticsTabProps {
  selectedRouteType: string;
  routeConfigurations: { [key: string]: RouteConfiguration };
  totalSavedPlaces: number;
  totalTripDays: number;
  onRouteTypeChange: (routeType: string) => void;
}

const AnalyticsTab = ({
  selectedRouteType,
  routeConfigurations,
  totalSavedPlaces,
  totalTripDays,
  onRouteTypeChange,
}: AnalyticsTabProps) => {
  const currentRoute = routeConfigurations[selectedRouteType];

  return (
    <div className="space-y-6 mt-6">
      {/* Route Performance Metrics */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="text-blue-600" size={20} />
            <span>Route Performance Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">
                {currentRoute.efficiency}
              </p>
              <p className="text-sm text-blue-800">Route Efficiency</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">
                {currentRoute.duration}
              </p>
              <p className="text-sm text-green-800">Total Duration</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">
                {totalSavedPlaces}
              </p>
              <p className="text-sm text-purple-800">Places Covered</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-600">
                {totalTripDays}
              </p>
              <p className="text-sm text-orange-800">Trip Days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Route className="text-purple-600" size={20} />
            <span>Alternative Routes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-3">
            <span className="text-sm font-medium text-gray-600">
              Select Route:
            </span>
            <Select value={selectedRouteType} onValueChange={onRouteTypeChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Route</SelectItem>
                <SelectItem value="speed">Speed Route</SelectItem>
                <SelectItem value="leisure">Leisure Route</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {Object.entries(routeConfigurations).map(([key, config]) => (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedRouteType === key
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
                onClick={() => onRouteTypeChange(key)}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {config.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {config.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock size={12} className="mr-1" />
                        {config.duration}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp size={12} className="mr-1" />
                        {config.efficiency} efficient
                      </Badge>
                    </div>
                  </div>
                  {selectedRouteType === key && (
                    <Badge className="bg-purple-100 text-purple-800 mt-2 sm:mt-0">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Route Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="text-yellow-600" size={20} />
            <span>AI Route Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">
              🤖 AI Recommendations
            </h4>
            <ul className="space-y-2 text-sm text-purple-700">
              <li>
                • This route optimizes for {currentRoute.efficiency} efficiency
              </li>
              <li>• Expected total travel time: {currentRoute.duration}</li>
              <li>
                • {totalSavedPlaces} saved places will be visited over{" "}
                {totalTripDays} days
              </li>
              <li>• Route considers traffic patterns and opening hours</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-800 mb-2 flex items-center">
                <MapPin size={16} className="mr-2" />
                Route Highlights
              </h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Minimized walking distances</li>
                <li>• Optimized for public transport</li>
                <li>• Groups nearby attractions</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                <Clock size={16} className="mr-2" />
                Time Optimization
              </h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Avoids peak hours</li>
                <li>• Considers venue opening times</li>
                <li>• Includes buffer time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
