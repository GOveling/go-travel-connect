import { useState } from "react";
import { Calendar, MapPin, Users, Globe, Phone, Edit3, Share2, UserPlus, X, Plane, Car, Building, Clock, ExternalLink, Star, Heart } from "lucide-react";
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

interface TripDetailModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
}

const TripDetailModal = ({ trip, isOpen, onClose }: TripDetailModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock saved places data for each destination
  const savedPlacesByDestination = {
    "Paris": [
      {
        id: "1",
        name: "Eiffel Tower",
        category: "Landmark",
        rating: 4.8,
        image: "🗼",
        description: "Iconic iron tower and symbol of Paris",
        estimatedTime: "2-3 hours",
        priority: "high" as const
      },
      {
        id: "2",
        name: "Louvre Museum",
        category: "Museum",
        rating: 4.7,
        image: "🎨",
        description: "World's largest art museum",
        estimatedTime: "4-6 hours",
        priority: "high" as const
      },
      {
        id: "3",
        name: "Café de Flore",
        category: "Restaurant",
        rating: 4.3,
        image: "☕",
        description: "Historic café in Saint-Germain",
        estimatedTime: "1-2 hours",
        priority: "medium" as const
      }
    ],
    "Rome": [
      {
        id: "4",
        name: "Colosseum",
        category: "Landmark",
        rating: 4.9,
        image: "🏛️",
        description: "Ancient Roman amphitheater",
        estimatedTime: "2-3 hours",
        priority: "high" as const
      },
      {
        id: "5",
        name: "Vatican Museums",
        category: "Museum",
        rating: 4.8,
        image: "🎨",
        description: "Pope's art collection and Sistine Chapel",
        estimatedTime: "3-4 hours",
        priority: "high" as const
      },
      {
        id: "6",
        name: "Trevi Fountain",
        category: "Landmark",
        rating: 4.6,
        image: "⛲",
        description: "Famous baroque fountain",
        estimatedTime: "30 minutes",
        priority: "medium" as const
      }
    ],
    "Barcelona": [
      {
        id: "7",
        name: "Sagrada Familia",
        category: "Landmark",
        rating: 4.9,
        image: "⛪",
        description: "Gaudí's masterpiece basilica",
        estimatedTime: "2-3 hours",
        priority: "high" as const
      },
      {
        id: "8",
        name: "Park Güell",
        category: "Park",
        rating: 4.7,
        image: "🌳",
        description: "Colorful mosaic park by Gaudí",
        estimatedTime: "2-3 hours",
        priority: "high" as const
      },
      {
        id: "9",
        name: "La Boqueria Market",
        category: "Market",
        rating: 4.4,
        image: "🍅",
        description: "Famous food market on Las Ramblas",
        estimatedTime: "1-2 hours",
        priority: "medium" as const
      }
    ],
    "Tokyo": [
      {
        id: "10",
        name: "Senso-ji Temple",
        category: "Temple",
        rating: 4.6,
        image: "⛩️",
        description: "Tokyo's oldest Buddhist temple",
        estimatedTime: "1-2 hours",
        priority: "high" as const
      },
      {
        id: "11",
        name: "Shibuya Crossing",
        category: "Landmark",
        rating: 4.5,
        image: "🚦",
        description: "World's busiest pedestrian crossing",
        estimatedTime: "30 minutes",
        priority: "medium" as const
      }
    ],
    "Bali": [
      {
        id: "12",
        name: "Tanah Lot Temple",
        category: "Temple",
        rating: 4.5,
        image: "🏛️",
        description: "Temple on a rock formation in the sea",
        estimatedTime: "2 hours",
        priority: "high" as const
      },
      {
        id: "13",
        name: "Rice Terraces of Jatiluwih",
        category: "Nature",
        rating: 4.7,
        image: "🌾",
        description: "UNESCO World Heritage rice terraces",
        estimatedTime: "3-4 hours",
        priority: "high" as const
      }
    ]
  };

  if (!trip) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <span className="text-3xl">{trip.image}</span>
              <span>{trip.name}</span>
            </DialogTitle>
            <Badge className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(trip.status)}`}>
              {trip.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Info Header */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin size={16} />
              <span className="font-medium">{trip.destination}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar size={16} />
              <span>{trip.dates}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users size={16} />
              <span>{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Tab Navigation using shadcn Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              <TabsTrigger value="saved-places">Saved Places</TabsTrigger>
              <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">About This Trip</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {trip.description || "An amazing journey through beautiful destinations with unforgettable experiences and wonderful memories to be made."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h5 className="font-medium text-gray-800 mb-1">Budget</h5>
                    <p className="text-gray-600 text-sm">{trip.budget || "$2,500 per person"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h5 className="font-medium text-gray-800 mb-1">Accommodation</h5>
                    <p className="text-gray-600 text-sm">{trip.accommodation || "Hotels & Airbnb"}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <h5 className="font-medium text-gray-800 mb-1">Transportation</h5>
                  <p className="text-gray-600 text-sm">{trip.transportation || "Flights, trains, and local transport"}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="itinerary" className="space-y-6 mt-6">
              {/* Flight Booking Section */}
              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Plane className="text-purple-600" size={20} />
                    <span>Flight Booking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h5 className="font-medium text-purple-800 mb-2">Round-trip Flight</h5>
                    <p className="text-sm text-purple-600 mb-3">
                      From your location to {trip.coordinates[0]?.name}
                    </p>
                    <div className="flex space-x-2">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Search Flights
                      </Button>
                      <Button variant="outline" className="border-purple-300 text-purple-600">
                        Compare Prices
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Destinations and Booking Options */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                  <MapPin size={18} />
                  <span>Destinations & Bookings</span>
                </h4>
                
                {trip.coordinates.map((location, index) => (
                  <Card key={index} className="border-l-4 border-l-orange-400">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Destination Info */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-800">{location.name}</h5>
                            <p className="text-gray-600 text-sm">Day {index + 1} - {index + 2}</p>
                          </div>
                          <div className="text-gray-400 text-sm">
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </div>
                        </div>

                        {/* Booking Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Airport Transfer */}
                          {index === 0 && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <Car className="text-blue-600" size={16} />
                                <h6 className="font-medium text-blue-800">Airport Transfer</h6>
                              </div>
                              <p className="text-xs text-blue-600 mb-2">
                                From airport to accommodation
                              </p>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                                Book Transfer
                              </Button>
                            </div>
                          )}

                          {/* Hotel Booking */}
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Building className="text-green-600" size={16} />
                              <h6 className="font-medium text-green-800">Hotel Options</h6>
                            </div>
                            <p className="text-xs text-green-600 mb-2">
                              Best rates in {location.name}
                            </p>
                            <div className="flex space-x-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                                Search Hotels
                              </Button>
                              <Button size="sm" variant="outline" className="border-green-300 text-green-600 text-xs">
                                View Deals
                              </Button>
                            </div>
                          </div>

                          {/* Local Transport (for destinations after the first) */}
                          {index > 0 && (
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <Car className="text-orange-600" size={16} />
                                <h6 className="font-medium text-orange-800">Transport to {location.name}</h6>
                              </div>
                              <p className="text-xs text-orange-600 mb-2">
                                From {trip.coordinates[index - 1]?.name}
                              </p>
                              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-xs">
                                Book Transport
                              </Button>
                            </div>
                          )}

                          {/* Activities */}
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="text-purple-600" size={16} />
                              <h6 className="font-medium text-purple-800">Activities & Tours</h6>
                            </div>
                            <p className="text-xs text-purple-600 mb-2">
                              Explore {location.name}
                            </p>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs">
                              Find Tours
                            </Button>
                          </div>
                        </div>

                        {/* Quick Info */}
                        <div className="border-t pt-3 mt-3">
                          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock size={12} />
                              <span>2-3 days</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Building size={12} />
                              <span>Hotels available</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ExternalLink size={12} />
                              <span>Book online</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Package Deals */}
              <Card className="bg-gradient-to-r from-purple-50 to-orange-50 border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Package Deals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-800 mb-2">Complete Trip Package</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      Flights + Hotels + Transfers for the entire trip
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">Save up to 25%</span>
                      <Button className="bg-gradient-to-r from-purple-600 to-orange-500">
                        Book Package
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved-places" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                  <Heart size={18} className="text-red-500" />
                  <span>Saved Places</span>
                </h4>
                <Button size="sm" variant="outline">
                  <MapPin size={16} className="mr-1" />
                  Add Place
                </Button>
              </div>

              {trip.coordinates.map((destination, destIndex) => {
                const placesForDestination = savedPlacesByDestination[destination.name as keyof typeof savedPlacesByDestination] || [];
                
                return (
                  <div key={destIndex} className="space-y-3">
                    <div className="flex items-center space-x-2 border-b pb-2">
                      <MapPin size={16} className="text-orange-500" />
                      <h5 className="font-medium text-gray-800">{destination.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {placesForDestination.length} place{placesForDestination.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {placesForDestination.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {placesForDestination.map((place) => (
                          <Card key={place.id} className="border-l-4 border-l-red-400">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{place.image}</span>
                                    <div>
                                      <h6 className="font-medium text-gray-800">{place.name}</h6>
                                      <p className="text-xs text-gray-600">{place.category}</p>
                                    </div>
                                  </div>
                                  <Badge className={`text-xs px-2 py-1 ${getPriorityColor(place.priority)}`}>
                                    {place.priority}
                                  </Badge>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1">
                                    <Star size={12} className="text-yellow-500 fill-current" />
                                    <span className="text-xs text-gray-600">{place.rating}</span>
                                  </div>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-600">{place.estimatedTime}</span>
                                </div>

                                <p className="text-xs text-gray-600 leading-relaxed">
                                  {place.description}
                                </p>

                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" className="flex-1 text-xs">
                                    View Details
                                  </Button>
                                  <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500 text-xs">
                                    Add to Schedule
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-dashed border-2 border-gray-200">
                        <CardContent className="p-6 text-center">
                          <MapPin size={32} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-gray-500 text-sm">No places saved for {destination.name}</p>
                          <p className="text-gray-400 text-xs">Explore and save places you want to visit</p>
                          <Button size="sm" variant="outline" className="mt-3">
                            Browse Places
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="collaborators" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">Trip Collaborators</h4>
                {trip.isGroupTrip && (
                  <Button size="sm" variant="outline">
                    <UserPlus size={16} className="mr-1" />
                    Invite
                  </Button>
                )}
              </div>

              {trip.collaborators && trip.collaborators.length > 0 ? (
                <div className="space-y-3">
                  {trip.collaborators.map((collaborator) => (
                    <Card key={collaborator.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                              {collaborator.avatar}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-800">{collaborator.name}</h5>
                              <p className="text-gray-600 text-sm">{collaborator.email}</p>
                            </div>
                          </div>
                          <Badge className={`text-xs px-2 py-1 rounded-full ${getRoleColor(collaborator.role)}`}>
                            {collaborator.role}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>This is a solo trip</p>
                  <p className="text-sm">Convert to group trip to add collaborators</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600">
              <Edit3 size={16} className="mr-2" />
              Edit Trip
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 size={16} className="mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TripDetailModal;
