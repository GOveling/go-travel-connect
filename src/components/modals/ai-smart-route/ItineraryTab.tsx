
import { Calendar, Clock, Navigation, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayItinerary, RouteConfiguration } from "@/types/aiSmartRoute";
import { getPriorityColor } from "@/utils/aiSmartRoute";

interface ItineraryTabProps {
  optimizedItinerary: DayItinerary[];
  selectedRouteType: string;
  routeConfigurations: { [key: string]: RouteConfiguration };
  totalSavedPlaces: number;
  totalTripDays: number;
  onRouteTypeChange: (routeType: string) => void;
}

const ItineraryTab = ({
  optimizedItinerary,
  selectedRouteType,
  routeConfigurations,
  totalSavedPlaces,
  totalTripDays,
  onRouteTypeChange
}: ItineraryTabProps) => {
  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200 flex-1">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
            <span className="mr-2">🧠</span>
            AI-Optimized Itinerary - {routeConfigurations[selectedRouteType]?.name}
          </h4>
          <p className="text-purple-600 text-sm">
            {routeConfigurations[selectedRouteType]?.description}
          </p>
          <p className="text-purple-500 text-xs mt-1">
            Based on your {totalSavedPlaces} saved places over {totalTripDays} allocated days
          </p>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600 mb-2">Route Type:</span>
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
      </div>

      {optimizedItinerary.map((day) => (
        <Card key={day.day} className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="text-purple-600" size={20} />
                <span>{day.date}</span>
                <Badge variant="outline" className="text-xs">
                  {day.destinationName}
                </Badge>
                <Badge className="text-xs bg-purple-100 text-purple-800">
                  {day.allocatedDays} day{day.allocatedDays > 1 ? 's' : ''} allocated
                </Badge>
              </div>
              <div className="flex space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {day.totalTime}
                </span>
                <span className="flex items-center">
                  <Navigation size={14} className="mr-1" />
                  {day.walkingTime} walking
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {day.places.map((place, index) => (
              <div key={place.id} className="relative">
                {index < day.places.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-purple-200"></div>
                )}
                <div className="flex items-start space-x-4 bg-white p-4 rounded-lg border">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {place.orderInRoute}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{place.bestTimeToVisit}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-800 flex items-center space-x-2">
                          <span className="text-xl">{place.image}</span>
                          <span>{place.name}</span>
                        </h5>
                        <p className="text-sm text-gray-600">{place.category}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-xs mb-1 ${getPriorityColor(place.priority)}`}>
                          {place.priority}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star size={12} className="text-yellow-500 fill-current mr-1" />
                          {place.rating}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{place.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-purple-50 p-2 rounded">
                        <span className="font-medium text-purple-800">AI Duration:</span>
                        <span className="text-purple-600 ml-1">{place.aiRecommendedDuration}</span>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="font-medium text-blue-800">Best Time:</span>
                        <span className="text-blue-600 ml-1">{place.bestTimeToVisit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <h6 className="font-medium text-gray-800 mb-2">Day Summary</h6>
              <div className="grid grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Activity Time:</span>
                  <p className="font-medium">{day.totalTime}</p>
                </div>
                <div>
                  <span className="text-gray-600">Walking Time:</span>
                  <p className="font-medium">{day.walkingTime}</p>
                </div>
                <div>
                  <span className="text-gray-600">Transport Time:</span>
                  <p className="font-medium">{day.transportTime}</p>
                </div>
                <div>
                  <span className="text-gray-600">Free Time:</span>
                  <p className="font-medium">{day.freeTime}</p>
                </div>
                <div>
                  <span className="text-gray-600">Days Allocated:</span>
                  <p className="font-medium">{day.allocatedDays}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ItineraryTab;
