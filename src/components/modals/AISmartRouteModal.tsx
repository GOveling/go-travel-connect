
import { useState } from "react";
import { Calendar, Clock, MapPin, Brain, X, Route, Navigation, Star, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "editor" | "viewer";
}

interface TripCoordinate {
  name: string;
  lat: number;
  lng: number;
}

interface Trip {
  id: number;
  name: string;
  destination: string;
  dates: string;
  status: string;
  travelers: number;
  image: string;
  isGroupTrip: boolean;
  collaborators?: Collaborator[];
  coordinates: TripCoordinate[];
  description?: string;
  budget?: string;
  accommodation?: string;
  transportation?: string;
}

interface OptimizedPlace {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  estimatedTime: string;
  priority: "high" | "medium" | "low";
  lat: number;
  lng: number;
  aiRecommendedDuration: string;
  bestTimeToVisit: string;
  orderInRoute: number;
}

interface DayItinerary {
  day: number;
  date: string;
  places: OptimizedPlace[];
  totalTime: string;
  walkingTime: string;
  transportTime: string;
  freeTime: string;
}

interface AISmartRouteModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
}

const AISmartRouteModal = ({ trip, isOpen, onClose }: AISmartRouteModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [routeGenerated, setRouteGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [optimizedItinerary, setOptimizedItinerary] = useState<DayItinerary[]>([]);

  // Mock AI-optimized data based on trip destinations
  const generateAIRoute = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock AI-generated optimized itinerary
    const mockItinerary: DayItinerary[] = [
      {
        day: 1,
        date: "Dec 15, 2024",
        places: [
          {
            id: "1",
            name: "Eiffel Tower",
            category: "Landmark",
            rating: 4.8,
            image: "🗼",
            description: "Iconic iron tower and symbol of Paris",
            estimatedTime: "2-3 hours",
            priority: "high",
            lat: 48.8584,
            lng: 2.2945,
            aiRecommendedDuration: "2.5 hours",
            bestTimeToVisit: "9:00 AM",
            orderInRoute: 1
          },
          {
            id: "2",
            name: "Louvre Museum",
            category: "Museum",
            rating: 4.7,
            image: "🎨",
            description: "World's largest art museum",
            estimatedTime: "4-6 hours",
            priority: "high",
            lat: 48.8606,
            lng: 2.3376,
            aiRecommendedDuration: "3 hours",
            bestTimeToVisit: "2:00 PM",
            orderInRoute: 2
          },
          {
            id: "3",
            name: "Café de Flore",
            category: "Restaurant",
            rating: 4.3,
            image: "☕",
            description: "Historic café in Saint-Germain",
            estimatedTime: "1-2 hours",
            priority: "medium",
            lat: 48.8542,
            lng: 2.3320,
            aiRecommendedDuration: "1 hour",
            bestTimeToVisit: "6:00 PM",
            orderInRoute: 3
          }
        ],
        totalTime: "6.5 hours",
        walkingTime: "45 minutes",
        transportTime: "30 minutes",
        freeTime: "2 hours"
      },
      {
        day: 2,
        date: "Dec 16, 2024",
        places: [
          {
            id: "4",
            name: "Notre-Dame Cathedral",
            category: "Landmark",
            rating: 4.6,
            image: "⛪",
            description: "Gothic cathedral masterpiece",
            estimatedTime: "1-2 hours",
            priority: "high",
            lat: 48.8530,
            lng: 2.3499,
            aiRecommendedDuration: "1.5 hours",
            bestTimeToVisit: "10:00 AM",
            orderInRoute: 1
          },
          {
            id: "5",
            name: "Champs-Élysées",
            category: "Shopping",
            rating: 4.4,
            image: "🛍️",
            description: "Famous shopping avenue",
            estimatedTime: "2-3 hours",
            priority: "medium",
            lat: 48.8698,
            lng: 2.3080,
            aiRecommendedDuration: "2 hours",
            bestTimeToVisit: "2:00 PM",
            orderInRoute: 2
          }
        ],
        totalTime: "3.5 hours",
        walkingTime: "30 minutes",
        transportTime: "20 minutes",
        freeTime: "4 hours"
      }
    ];

    setOptimizedItinerary(mockItinerary);
    setRouteGenerated(true);
    setIsGenerating(false);
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

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
            <Brain className="text-purple-600" size={28} />
            <span>AI Smart Route for {trip.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!routeGenerated ? (
            <div className="text-center py-12">
              <Brain size={64} className="mx-auto mb-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                AI Route Optimization
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our AI will analyze your saved places, consider opening hours, crowd patterns, 
                travel distances, and optimal timing to create the perfect itinerary for your trip.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <MapPin className="mx-auto mb-2 text-blue-600" size={24} />
                  <p className="text-sm font-medium text-blue-800">Geolocation Analysis</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <Clock className="mx-auto mb-2 text-green-600" size={24} />
                  <p className="text-sm font-medium text-green-800">Time Optimization</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <Route className="mx-auto mb-2 text-purple-600" size={24} />
                  <p className="text-sm font-medium text-purple-800">Route Planning</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <Star className="mx-auto mb-2 text-orange-600" size={24} />
                  <p className="text-sm font-medium text-orange-800">Priority Ranking</p>
                </div>
              </div>

              <Button 
                onClick={generateAIRoute}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3"
              >
                {isGenerating ? (
                  <>
                    <Brain className="animate-spin mr-2" size={20} />
                    Generating Optimal Route...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2" size={20} />
                    Generate AI Smart Route
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="itinerary">Daily Itinerary</TabsTrigger>
                <TabsTrigger value="map">Route Map</TabsTrigger>
                <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="space-y-6 mt-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                    <Brain className="mr-2" size={18} />
                    AI-Optimized Itinerary
                  </h4>
                  <p className="text-purple-600 text-sm">
                    This route is optimized for minimal travel time, optimal visiting hours, and maximum enjoyment based on crowd patterns and weather data.
                  </p>
                </div>

                {optimizedItinerary.map((day) => (
                  <Card key={day.day} className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="text-purple-600" size={20} />
                          <span>Day {day.day} - {day.date}</span>
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
                        <div className="grid grid-cols-4 gap-4 text-sm">
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="map" className="space-y-4 mt-6">
                <Card className="h-96 bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-dashed border-purple-300">
                  <CardContent className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={48} className="mx-auto text-purple-600 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Route Map</h3>
                      <p className="text-gray-600">AI-optimized route with turn-by-turn directions</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Shows optimized walking paths, transport connections, and estimated travel times
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Route Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Distance:</span>
                        <span className="font-medium">12.5 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Walking Distance:</span>
                        <span className="font-medium">6.2 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transport Distance:</span>
                        <span className="font-medium">6.3 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Travel Time:</span>
                        <span className="font-medium">1.5 hours</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Transport Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Metro (fastest)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Bus (economical)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">Walking (scenic)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Taxi (convenient)</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4 mt-6">
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
                          <h6 className="font-medium text-green-800">Crowd Analysis</h6>
                          <p className="text-sm text-green-600">Optimized for low-crowd periods</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h6 className="font-medium text-blue-800">Weather Consideration</h6>
                          <p className="text-sm text-blue-600">Indoor activities during rain forecasts</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <h6 className="font-medium text-purple-800">Opening Hours</h6>
                          <p className="text-sm text-purple-600">All venues open during planned visits</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <h6 className="font-medium text-orange-800">Travel Efficiency</h6>
                          <p className="text-sm text-orange-600">Minimized backtracking and delays</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Efficiency Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Route Efficiency:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div className="w-16 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">92%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Time Optimization:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div className="w-18 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">88%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Cost Efficiency:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full">
                              <div className="w-14 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">85%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg mt-4">
                        <h6 className="font-medium text-gray-800 mb-2">AI Recommendations</h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Visit Eiffel Tower early morning for best photos</li>
                          <li>• Book Louvre tickets in advance to skip lines</li>
                          <li>• Use Metro day pass for cost savings</li>
                          <li>• Keep umbrella handy for afternoon showers</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Alternative Routes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h6 className="font-medium text-green-800 mb-2">Current Route</h6>
                        <p className="text-sm text-green-600 mb-2">Optimal balance of time and experience</p>
                        <div className="text-xs text-green-700">
                          <p>Duration: 2 days</p>
                          <p>Efficiency: 92%</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h6 className="font-medium text-blue-800 mb-2">Speed Route</h6>
                        <p className="text-sm text-blue-600 mb-2">Maximum places in minimum time</p>
                        <div className="text-xs text-blue-700">
                          <p>Duration: 1.5 days</p>
                          <p>Efficiency: 98%</p>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h6 className="font-medium text-purple-800 mb-2">Leisure Route</h6>
                        <p className="text-sm text-purple-600 mb-2">More time at each location</p>
                        <div className="text-xs text-purple-700">
                          <p>Duration: 3 days</p>
                          <p>Efficiency: 78%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {routeGenerated && (
            <div className="flex space-x-3 pt-4 border-t">
              <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Save to Trip
              </Button>
              <Button variant="outline" className="flex-1">
                Export Itinerary
              </Button>
              <Button variant="outline" className="flex-1">
                Share Route
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISmartRouteModal;
