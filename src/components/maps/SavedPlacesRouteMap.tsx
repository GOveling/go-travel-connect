
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Clock, Star, ArrowRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SavedPlace {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  estimatedTime: string;
  priority: "high" | "medium" | "low";
}

interface SavedPlacesRouteMapProps {
  destination: string;
  places: SavedPlace[];
  onClose: () => void;
}

const SavedPlacesRouteMap = ({ destination, places, onClose }: SavedPlacesRouteMapProps) => {
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
  const [showOptimizedRoute, setShowOptimizedRoute] = useState(false);

  // AI-generated optimal route based on priority and estimated time
  const generateOptimalRoute = () => {
    setIsGeneratingRoute(true);
    
    // Simulate AI route generation
    setTimeout(() => {
      setIsGeneratingRoute(false);
      setShowOptimizedRoute(true);
    }, 2000);
  };

  // Sort places by priority and estimated time for optimal route
  const optimizedRoute = [...places].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    // If same priority, sort by estimated time (shorter first)
    const timeA = parseInt(a.estimatedTime.split('-')[0]);
    const timeB = parseInt(b.estimatedTime.split('-')[0]);
    return timeA - timeB;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalEstimatedTime = optimizedRoute.reduce((total, place) => {
    const time = parseInt(place.estimatedTime.split('-')[0]);
    return total + time;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                <Navigation className="text-blue-600" size={24} />
                <span>Optimal Route for {destination}</span>
              </h2>
              <p className="text-gray-600 mt-1">AI-generated route for your saved places</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Map Placeholder */}
          <Card className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-dashed border-blue-300">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Route Map</h3>
                <p className="text-gray-600">Visual route map will be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">Connect to mapping service for full functionality</p>
              </div>
            </CardContent>
          </Card>

          {/* Route Generation */}
          <div className="flex justify-center">
            {!showOptimizedRoute ? (
              <Button 
                onClick={generateOptimalRoute}
                disabled={isGeneratingRoute}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isGeneratingRoute ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Generating AI Route...
                  </>
                ) : (
                  <>
                    <Navigation size={16} className="mr-2" />
                    Generate Optimal Route with AI
                  </>
                )}
              </Button>
            ) : (
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800 px-4 py-2">
                  <Navigation size={14} className="mr-1" />
                  Optimal Route Generated
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Total estimated time: {totalEstimatedTime} hours
                </p>
              </div>
            )}
          </div>

          {/* Route List */}
          {showOptimizedRoute && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <Clock size={18} className="text-purple-600" />
                <span>Optimized Itinerary</span>
              </h3>
              
              <div className="space-y-3">
                {optimizedRoute.map((place, index) => (
                  <Card key={place.id} className="border-l-4 border-l-purple-400">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{place.image}</span>
                            <div>
                              <h4 className="font-medium text-gray-800">{place.name}</h4>
                              <p className="text-sm text-gray-600">{place.category}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Star size={14} className="text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{place.rating}</span>
                          </div>
                          <Badge className={`text-xs px-2 py-1 ${getPriorityColor(place.priority)}`}>
                            {place.priority}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Clock size={14} />
                            <span>{place.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-2 ml-12">
                        {place.description}
                      </p>
                      
                      {index < optimizedRoute.length - 1 && (
                        <div className="flex items-center justify-center mt-3">
                          <ArrowRight size={16} className="text-purple-600" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Route Summary */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Route Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{optimizedRoute.length}</p>
                      <p className="text-sm text-gray-600">Places</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{totalEstimatedTime}h</p>
                      <p className="text-sm text-gray-600">Total Time</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {optimizedRoute.filter(p => p.priority === 'high').length}
                      </p>
                      <p className="text-sm text-gray-600">High Priority</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500">
              <Navigation size={16} className="mr-2" />
              Start Navigation
            </Button>
            <Button variant="outline" className="flex-1">
              Export Route
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedPlacesRouteMap;
