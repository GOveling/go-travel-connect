
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
    <div className="space-y-4 mt-4 px-2 sm:px-0">
      <div className="flex flex-col gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 sm:p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center text-sm sm:text-base">
            <span className="mr-2">🧠</span>
            AI-Optimized Itinerary - {routeConfigurations[selectedRouteType]?.name}
          </h4>
          <p className="text-purple-600 text-xs sm:text-sm">
            {routeConfigurations[selectedRouteType]?.description}
          </p>
          <p className="text-purple-500 text-xs mt-1">
            Based on your {totalSavedPlaces} saved places over {totalTripDays} allocated days
          </p>
        </div>
        
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600 mb-2">Route Type:</span>
          <Select value={selectedRouteType} onValueChange={onRouteTypeChange}>
            <SelectTrigger className="w-full sm:w-40">
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
        <Card key={day.day} className={`border-l-4 ${day.isSuggested ? 'border-l-orange-500 bg-orange-50' : 'border-l-purple-500'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Calendar className={day.isSuggested ? "text-orange-600" : "text-purple-600"} size={18} />
                  <span className="text-base sm:text-lg">{day.date}</span>
                  {day.isSuggested && (
                    <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                      AI Suggested
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {day.destinationName}
                  </Badge>
                  <Badge className={`text-xs ${day.isSuggested ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                    {day.allocatedDays} day{day.allocatedDays > 1 ? 's' : ''} allocated
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {day.totalTime}
                </span>
                <span className="flex items-center">
                  <Navigation size={12} className="mr-1" />
                  {day.walkingTime} walking
                </span>
              </div>
            </CardTitle>
            {day.isSuggested && (
              <div className="bg-orange-100 p-2 rounded-lg border border-orange-200 mt-2">
                <p className="text-xs text-orange-700">
                  💡 <strong>AI Suggestion:</strong> This day was available in your schedule. We've suggested popular nearby places you might enjoy visiting.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {day.places.map((place, index) => (
              <div key={place.id} className="relative">
                {index < day.places.length - 1 && (
                  <div className={`absolute left-6 top-16 w-0.5 h-8 ${day.isSuggested ? 'bg-orange-200' : 'bg-purple-200'} hidden sm:block`}></div>
                )}
                <div className={`flex flex-col sm:flex-row sm:items-start gap-3 bg-white p-3 rounded-lg border ${day.isSuggested ? 'border-orange-200' : ''}`}>
                  <div className="flex sm:flex-col items-center sm:items-center gap-2 sm:gap-1">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${day.isSuggested ? 'bg-gradient-to-br from-orange-500 to-yellow-500' : 'bg-gradient-to-br from-purple-500 to-blue-500'} rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base`}>
                      {place.orderInRoute}
                    </div>
                    <span className="text-xs text-gray-500">{place.bestTimeToVisit}</span>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 flex items-center space-x-2 text-sm sm:text-base">
                          <span className="text-lg sm:text-xl">{place.image}</span>
                          <span className="break-words">{place.name}</span>
                          {day.isSuggested && (
                            <span className="text-xs text-orange-600 font-normal">(Suggested)</span>
                          )}
                        </h5>
                        <p className="text-xs sm:text-sm text-gray-600">{place.category}</p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                        <Badge className={`text-xs ${getPriorityColor(place.priority)}`}>
                          {place.priority}
                        </Badge>
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <Star size={12} className="text-yellow-500 fill-current mr-1" />
                          {place.rating}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{place.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className={`${day.isSuggested ? 'bg-orange-50' : 'bg-purple-50'} p-2 rounded`}>
                        <span className={`font-medium ${day.isSuggested ? 'text-orange-800' : 'text-purple-800'}`}>AI Duration:</span>
                        <span className={`${day.isSuggested ? 'text-orange-600' : 'text-purple-600'} ml-1`}>{place.aiRecommendedDuration}</span>
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
              <h6 className="font-medium text-gray-800 mb-3 text-sm">Day Summary</h6>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <span className="text-gray-600 block mb-1">Total Activity Time:</span>
                  <p className="font-medium">{day.totalTime}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Walking Time:</span>
                  <p className="font-medium">{day.walkingTime}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Transport Time:</span>
                  <p className="font-medium">{day.transportTime}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-1">Free Time:</span>
                  <p className="font-medium">{day.freeTime}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-600 block mb-1">Days Allocated:</span>
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
