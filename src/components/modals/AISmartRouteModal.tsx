import { useState } from "react";
import { Calendar, Clock, MapPin, Brain, X, Route, Navigation, Star, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  savedPlaces?: SavedPlace[];
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
  destinationName: string;
}

interface SavedPlace {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  estimatedTime: string;
  priority: "high" | "medium" | "low";
  destinationName?: string;
  lat?: number;
  lng?: number;
}

interface DayItinerary {
  day: number;
  date: string;
  destinationName: string;
  places: OptimizedPlace[];
  totalTime: string;
  walkingTime: string;
  transportTime: string;
  freeTime: string;
  allocatedDays: number;
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
  const [selectedRouteType, setSelectedRouteType] = useState("current");
  const [optimizedItinerary, setOptimizedItinerary] = useState<DayItinerary[]>([]);

  // Get saved places ONLY from the trip data (from View Details section)
  const getSavedPlacesByDestination = () => {
    if (!trip?.savedPlaces) return {};
    
    const placesByDestination: { [key: string]: SavedPlace[] } = {};
    
    // Group saved places by destination
    trip.savedPlaces.forEach(place => {
      const destinationName = place.destinationName || trip.destination;
      if (!placesByDestination[destinationName]) {
        placesByDestination[destinationName] = [];
      }
      placesByDestination[destinationName].push(place);
    });
    
    return placesByDestination;
  };

  // Calculate days per destination based on trip duration
  const calculateDestinationDays = (tripDates: string, totalDestinations: number) => {
    try {
      const dateRange = tripDates.split(' - ');
      if (dateRange.length !== 2) return Array(totalDestinations).fill(1);
      
      const startDateStr = dateRange[0];
      const endDateStr = dateRange[1];
      
      const year = endDateStr.split(', ')[1] || new Date().getFullYear().toString();
      
      const startMonth = startDateStr.split(' ')[0];
      const startDay = parseInt(startDateStr.split(' ')[1]);
      
      const endMonth = endDateStr.split(' ')[0];
      const endDay = parseInt(endDateStr.split(' ')[1].split(',')[0]);
      
      const monthMap: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const startDate = new Date(parseInt(year), monthMap[startMonth], startDay);
      const endDate = new Date(parseInt(year), monthMap[endMonth], endDay);
      
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const savedPlacesByDestination = getSavedPlacesByDestination();
      
      // Distribute days among destinations (give more days to destinations with more saved places)
      const destinationDays = [];
      let remainingDays = totalDays;
      
      trip?.coordinates.forEach((destination, index) => {
        const savedPlaces = savedPlacesByDestination[destination.name] || [];
        const isLast = index === totalDestinations - 1;
        
        if (isLast) {
          destinationDays.push(Math.max(1, remainingDays));
        } else {
          // Allocate days based on number of saved places (minimum 1 day)
          const baseDays = Math.max(1, Math.ceil(savedPlaces.length / 3));
          const allocatedDays = Math.min(baseDays, Math.floor(remainingDays / (totalDestinations - index)));
          destinationDays.push(Math.max(1, allocatedDays));
          remainingDays -= allocatedDays;
        }
      });
      
      return destinationDays;
    } catch (error) {
      return Array(totalDestinations).fill(1);
    }
  };

  // Function to parse trip dates and calculate destination dates with proper day allocation
  const getDestinationDates = (tripDates: string, destinationIndex: number, totalDestinations: number, allocatedDays: number) => {
    try {
      const dateRange = tripDates.split(' - ');
      if (dateRange.length !== 2) return `Day ${destinationIndex + 1}${allocatedDays > 1 ? `-${destinationIndex + allocatedDays}` : ''}`;
      
      const startDateStr = dateRange[0];
      const endDateStr = dateRange[1];
      
      const year = endDateStr.split(', ')[1] || new Date().getFullYear().toString();
      
      const startMonth = startDateStr.split(' ')[0];
      const startDay = parseInt(startDateStr.split(' ')[1]);
      
      const monthMap: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const startDate = new Date(parseInt(year), monthMap[startMonth], startDay);
      
      // Calculate cumulative days for this destination
      const destinationDays = calculateDestinationDays(tripDates, totalDestinations);
      let dayOffset = 0;
      for (let i = 0; i < destinationIndex; i++) {
        dayOffset += destinationDays[i];
      }
      
      const destStartDate = new Date(startDate);
      destStartDate.setDate(startDate.getDate() + dayOffset);
      
      const destEndDate = new Date(destStartDate);
      destEndDate.setDate(destStartDate.getDate() + allocatedDays - 1);
      
      const formatDate = (date: Date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
      };
      
      if (allocatedDays === 1) {
        return formatDate(destStartDate);
      } else {
        return `${formatDate(destStartDate)} - ${formatDate(destEndDate)}`;
      }
    } catch (error) {
      return `Day ${destinationIndex + 1}${allocatedDays > 1 ? `-${destinationIndex + allocatedDays}` : ''}`;
    }
  };

  // Generate AI optimized routes based ONLY on actual saved places from the trip
  const generateOptimizedRoutes = () => {
    if (!trip) return { current: [], speed: [], leisure: [] };

    const routes = { current: [] as DayItinerary[], speed: [] as DayItinerary[], leisure: [] as DayItinerary[] };
    const destinationDays = calculateDestinationDays(trip.dates, trip.coordinates.length);
    const savedPlacesByDestination = getSavedPlacesByDestination();

    trip.coordinates.forEach((destination, destIndex) => {
      const savedPlaces = savedPlacesByDestination[destination.name] || [];
      const allocatedDays = destinationDays[destIndex];
      
      if (savedPlaces.length === 0) return;

      const destinationDate = getDestinationDates(trip.dates, destIndex, trip.coordinates.length, allocatedDays);

      // Convert saved places to optimized places format
      const convertToOptimizedPlaces = (places: SavedPlace[], routeType: string) => {
        return places.map((place, index) => ({
          ...place,
          lat: place.lat || destination.lat,
          lng: place.lng || destination.lng,
          destinationName: destination.name,
          aiRecommendedDuration: routeType === 'speed' ? "1 hour" : 
                                 routeType === 'leisure' ? (place.estimatedTime.split('-')[1]?.trim() || place.estimatedTime) :
                                 place.estimatedTime.split('-')[0].trim(),
          bestTimeToVisit: routeType === 'speed' ? `${8 + (index % 8)}:00 ${index < 8 ? 'AM' : 'PM'}` :
                          routeType === 'leisure' ? (index === 0 ? "10:00 AM" : "3:00 PM") :
                          index === 0 ? "9:00 AM" : index === 1 ? "1:00 PM" : index === 2 ? "4:00 PM" : "6:00 PM",
          orderInRoute: index + 1
        }));
      };

      // Current Route: Balanced approach considering allocated days
      const placesPerDay = Math.ceil(savedPlaces.length / allocatedDays);
      const currentPlaces = savedPlaces
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, Math.min(placesPerDay * allocatedDays, savedPlaces.length));

      if (currentPlaces.length > 0) {
        routes.current.push({
          day: destIndex + 1,
          date: destinationDate,
          destinationName: destination.name,
          places: convertToOptimizedPlaces(currentPlaces, 'current'),
          totalTime: `${Math.ceil(currentPlaces.length * 2.5)} hours`,
          walkingTime: `${Math.ceil(currentPlaces.length * 0.5)} minutes`,
          transportTime: `${Math.ceil(currentPlaces.length * 0.3)} minutes`,
          freeTime: `${Math.max(1, allocatedDays - 1)} hours`,
          allocatedDays: allocatedDays
        });
      }

      // Speed Route: Maximum places per day across allocated days
      const speedPlacesPerDay = Math.min(6, Math.ceil(savedPlaces.length / allocatedDays));
      const speedPlaces = savedPlaces
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, speedPlacesPerDay * allocatedDays);

      if (speedPlaces.length > 0) {
        routes.speed.push({
          day: destIndex + 1,
          date: destinationDate,
          destinationName: destination.name,
          places: convertToOptimizedPlaces(speedPlaces, 'speed'),
          totalTime: `${speedPlaces.length} hours`,
          walkingTime: `${Math.ceil(speedPlaces.length * 0.7)} minutes`,
          transportTime: `${Math.ceil(speedPlaces.length * 0.5)} minutes`,
          freeTime: "30 minutes",
          allocatedDays: allocatedDays
        });
      }

      // Leisure Route: Fewer places with more time, respecting allocated days
      const leisurePlacesPerDay = Math.max(1, Math.floor(savedPlaces.length / (allocatedDays * 2)));
      const leisurePlaces = savedPlaces
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, leisurePlacesPerDay * allocatedDays);

      if (leisurePlaces.length > 0) {
        routes.leisure.push({
          day: destIndex + 1,
          date: destinationDate,
          destinationName: destination.name,
          places: convertToOptimizedPlaces(leisurePlaces, 'leisure'),
          totalTime: `${leisurePlaces.length * 3} hours`,
          walkingTime: "30 minutes",
          transportTime: "20 minutes",
          freeTime: `${allocatedDays * 3} hours`,
          allocatedDays: allocatedDays
        });
      }
    });

    return routes;
  };

  // Route configurations using actual saved places data only
  const getRouteConfigurations = () => {
    const routes = generateOptimizedRoutes();
    const totalDays = trip ? calculateDestinationDays(trip.dates, trip.coordinates.length).reduce((a, b) => a + b, 0) : 0;
    
    return {
      current: {
        name: "Current Route",
        description: "Optimal balance considering allocated days per destination",
        duration: `${totalDays} day${totalDays > 1 ? 's' : ''}`,
        efficiency: "92%",
        itinerary: routes.current
      },
      speed: {
        name: "Speed Route",
        description: "Maximum places within allocated timeframe",
        duration: `${totalDays} day${totalDays > 1 ? 's' : ''}`,
        efficiency: "98%",
        itinerary: routes.speed
      },
      leisure: {
        name: "Leisure Route",
        description: "Relaxed pace with more time per location",
        duration: `${totalDays} day${totalDays > 1 ? 's' : ''}`,
        efficiency: "78%",
        itinerary: routes.leisure
      }
    };
  };

  // Mock AI-optimized data based on trip destinations and day allocation
  const generateAIRoute = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Set initial route to current using actual saved places data
    const routeConfigurations = getRouteConfigurations();
    setOptimizedItinerary(routeConfigurations.current.itinerary);
    setRouteGenerated(true);
    setIsGenerating(false);
  };

  // Handle route type change
  const handleRouteTypeChange = (routeType: string) => {
    setSelectedRouteType(routeType);
    const routeConfigurations = getRouteConfigurations();
    const selectedConfig = routeConfigurations[routeType as keyof typeof routeConfigurations];
    setOptimizedItinerary(selectedConfig.itinerary);
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

  const routeConfigurations = getRouteConfigurations();
  const savedPlacesByDestination = getSavedPlacesByDestination();
  const totalSavedPlaces = Object.values(savedPlacesByDestination).reduce((total, places) => total + places.length, 0);
  const destinationDays = calculateDestinationDays(trip.dates, trip.coordinates.length);
  const totalTripDays = destinationDays.reduce((a, b) => a + b, 0);

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
                AI Route Optimization with Your Saved Places
              </h3>
              <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
                Our AI will analyze your {totalSavedPlaces} saved places across {trip.coordinates.length} destinations 
                over {totalTripDays} days, considering the allocated time per destination, opening hours, crowd patterns, 
                travel distances, and optimal timing to create the perfect itinerary.
              </p>
              
              {/* Day Allocation Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                <h4 className="font-medium text-blue-800 mb-3">Current Day Allocation</h4>
                <div className="grid grid-cols-1 gap-2">
                  {trip.coordinates.map((destination, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-blue-700">{destination.name}:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600 font-medium">{destinationDays[index]} day{destinationDays[index] > 1 ? 's' : ''}</span>
                        <span className="text-blue-500">
                          ({savedPlacesByDestination[destination.name]?.length || 0} saved places)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {totalSavedPlaces === 0 ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
                  <MapPin className="mx-auto mb-2 text-orange-600" size={32} />
                  <h4 className="font-medium text-orange-800 mb-2">No Saved Places Found</h4>
                  <p className="text-sm text-orange-600">
                    Please save some places in your trip details first to generate an AI route.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <MapPin className="mx-auto mb-2 text-blue-600" size={24} />
                      <p className="text-sm font-medium text-blue-800">Your Saved Places</p>
                      <p className="text-xs text-blue-600">{totalSavedPlaces} places</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Clock className="mx-auto mb-2 text-green-600" size={24} />
                      <p className="text-sm font-medium text-green-800">Time Optimization</p>
                      <p className="text-xs text-green-600">{totalTripDays} days analyzed</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <Route className="mx-auto mb-2 text-purple-600" size={24} />
                      <p className="text-sm font-medium text-purple-800">Route Planning</p>
                      <p className="text-xs text-purple-600">3 route options</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <Star className="mx-auto mb-2 text-orange-600" size={24} />
                      <p className="text-sm font-medium text-orange-800">Priority Ranking</p>
                      <p className="text-xs text-orange-600">Your preferences</p>
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
                        Analyzing Your {totalSavedPlaces} Saved Places...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2" size={20} />
                        Generate AI Smart Route
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="itinerary">Daily Itinerary</TabsTrigger>
                <TabsTrigger value="map">Route Map</TabsTrigger>
                <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200 flex-1 mr-4">
                    <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                      <Brain className="mr-2" size={18} />
                      AI-Optimized Itinerary - {routeConfigurations[selectedRouteType as keyof typeof routeConfigurations].name}
                    </h4>
                    <p className="text-purple-600 text-sm">
                      {routeConfigurations[selectedRouteType as keyof typeof routeConfigurations].description}
                    </p>
                    <p className="text-purple-500 text-xs mt-1">
                      Based on your {totalSavedPlaces} saved places over {totalTripDays} allocated days
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Route Type:</span>
                    <Select value={selectedRouteType} onValueChange={handleRouteTypeChange}>
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
                          <span>Day {day.day} - {day.date}</span>
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
              </TabsContent>

              <TabsContent value="map" className="space-y-4 mt-6">
                <Card className="h-96 bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-dashed border-purple-300">
                  <CardContent className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={48} className="mx-auto text-purple-600 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Route Map</h3>
                      <p className="text-gray-600">AI-optimized route with your saved places</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Shows optimized paths with your {totalSavedPlaces} saved places across {totalTripDays} days
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
                        <span className="text-gray-600">Your Saved Places:</span>
                        <span className="font-medium">{totalSavedPlaces}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destinations:</span>
                        <span className="font-medium">{trip.coordinates.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Days:</span>
                        <span className="font-medium">{totalTripDays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Est. Total Distance:</span>
                        <span className="font-medium">{Math.round(totalSavedPlaces * 2.5)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Travel Time:</span>
                        <span className="font-medium">{Math.round(totalSavedPlaces * 0.25)} hours</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Day Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {trip.coordinates.map((destination, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{destination.name}:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{destinationDays[index]} day{destinationDays[index] > 1 ? 's' : ''}</span>
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          </div>
                        </div>
                      ))}
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
                          <Select value={selectedRouteType} onValueChange={handleRouteTypeChange}>
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
                            <p>Duration: {routeConfigurations.current.duration}</p>
                            <p>Efficiency: {routeConfigurations.current.efficiency}</p>
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
                            <p>Duration: {routeConfigurations.speed.duration}</p>
                            <p>Efficiency: {routeConfigurations.speed.efficiency}</p>
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
                            <p>Duration: {routeConfigurations.leisure.duration}</p>
                            <p>Efficiency: {routeConfigurations.leisure.efficiency}</p>
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
