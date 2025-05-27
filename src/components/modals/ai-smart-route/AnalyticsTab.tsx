
import { Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  onRouteTypeChange
}: AnalyticsTabProps) => {
  return (
    <div className="space-y-4 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Brain className="mr-2 text-purple-600" size={20} />
              AI Optimization Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <h6 className="font-medium text-green-800">Your Saved Places</h6>
                <p className="text-sm text-green-600">Analyzed {totalSavedPlaces} places you've saved across {totalTripDays} allocated days</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <h6 className="font-medium text-blue-800">Priority-Based Routing</h6>
                <p className="text-sm text-blue-600">Routes optimized based on your priority ratings</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <h6 className="font-medium text-purple-800">Time Allocation</h6>
                <p className="text-sm text-purple-600">Smart scheduling within your allocated timeframe</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <h6 className="font-medium text-orange-800">Personalized Routes</h6>
                <p className="text-sm text-orange-600">Based entirely on places you've personally selected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Alternative Routes</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-normal text-gray-600">Select Route:</span>
                <Select value={selectedRouteType} onValueChange={onRouteTypeChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Route</SelectItem>
                    <SelectItem value="speed">Speed Route</SelectItem>
                    <SelectItem value="leisure">Leisure Route</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className={`p-4 rounded-lg border ${
                selectedRouteType === 'current' 
                  ? 'bg-green-100 border-green-300 ring-2 ring-green-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <h6 className="font-medium text-green-800 mb-2">Current Route</h6>
                <p className="text-sm text-green-600 mb-2">Optimal balance considering allocated days per destination</p>
                <div className="text-xs text-green-700">
                  <p>Duration: {routeConfigurations.current?.duration}</p>
                  <p>Efficiency: {routeConfigurations.current?.efficiency}</p>
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                selectedRouteType === 'speed' 
                  ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <h6 className="font-medium text-blue-800 mb-2">Speed Route</h6>
                <p className="text-sm text-blue-600 mb-2">Maximum saved places within allocated timeframe</p>
                <div className="text-xs text-blue-700">
                  <p>Duration: {routeConfigurations.speed?.duration}</p>
                  <p>Efficiency: {routeConfigurations.speed?.efficiency}</p>
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                selectedRouteType === 'leisure' 
                  ? 'bg-purple-100 border-purple-300 ring-2 ring-purple-200' 
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <h6 className="font-medium text-purple-800 mb-2">Leisure Route</h6>
                <p className="text-sm text-purple-600 mb-2">Relaxed pace with more time per saved place</p>
                <div className="text-xs text-purple-700">
                  <p>Duration: {routeConfigurations.leisure?.duration}</p>
                  <p>Efficiency: {routeConfigurations.leisure?.efficiency}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Saved Places Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Places Coverage:</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-full h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">100%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Priority Distribution:</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-17 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">90%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Time Optimization:</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-19 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">96%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg mt-4">
            <h6 className="font-medium text-gray-800 mb-2">AI Personalized Recommendations</h6>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All routes use only your personally saved places</li>
              <li>• Priority rankings from your preferences are considered</li>
              <li>• Time allocation respects your trip's day distribution</li>
              <li>• Routes optimize travel time between your selected places</li>
              <li>• Flexible scheduling allows for spontaneous discoveries</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
