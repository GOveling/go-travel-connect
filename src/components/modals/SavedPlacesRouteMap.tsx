
import { useState } from "react";
import { MapPin, X, Route, Navigation, Clock, Zap } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  isOpen: boolean;
  onClose: () => void;
  destinationName: string;
  places: SavedPlace[];
}

const SavedPlacesRouteMap = ({ isOpen, onClose, destinationName, places }: SavedPlacesRouteMapProps) => {
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
  const [routeGenerated, setRouteGenerated] = useState(false);

  const generateOptimalRoute = () => {
    setIsGeneratingRoute(true);
    // Simulate AI route generation
    setTimeout(() => {
      setIsGeneratingRoute(false);
      setRouteGenerated(true);
    }, 2000);
  };

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

  // Sort places by priority for optimal route
  const sortedPlaces = [...places].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 9999 }}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Route className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Optimal Route</h2>
                <p className="text-gray-600">{destinationName} • {places.length} places</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Map Placeholder */}
          <Card className="h-96 bg-gradient-to-br from-blue-100 to-orange-100 border-2 border-dashed border-blue-300">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Route Map</h3>
                <p className="text-gray-600 mb-4">Your optimal route will be displayed here</p>
                {!routeGenerated ? (
                  <Button 
                    onClick={generateOptimalRoute} 
                    disabled={isGeneratingRoute}
                    className="bg-gradient-to-r from-blue-500 to-orange-500"
                  >
                    {isGeneratingRoute ? (
                      <>
                        <Zap size={16} className="mr-2 animate-spin" />
                        Generating Route...
                      </>
                    ) : (
                      <>
                        <Navigation size={16} className="mr-2" />
                        Generate Optimal Route
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <Navigation size={16} />
                      <span className="font-medium">Route Generated Successfully!</span>
                    </div>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>~{Math.ceil(places.length * 1.5)} hours</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{places.length} stops</span>
                      </div>
                    </div>
                    <Button 
                      onClick={onClose}
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      Close Route
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Route Details */}
          {routeGenerated && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Route size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Optimized Route Order</h3>
                <Badge className="bg-green-100 text-green-800">AI Generated</Badge>
              </div>
              
              <div className="grid gap-3">
                {sortedPlaces.map((place, index) => (
                  <Card key={place.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{place.image}</span>
                            <div>
                              <h4 className="font-medium text-gray-800">{place.name}</h4>
                              <p className="text-sm text-gray-600">{place.category} • {place.estimatedTime}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getPriorityColor(place.priority)}`}>
                            {place.priority}
                          </Badge>
                          <div className="text-sm text-gray-600">★ {place.rating}</div>
                        </div>
                      </div>
                      {index < sortedPlaces.length - 1 && (
                        <div className="ml-7 mt-2 flex items-center text-xs text-gray-500">
                          <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 border-dashed"></div>
                          <span className="ml-2">~15 min walk</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-orange-500">
              Save Route
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SavedPlacesRouteMap;
