
import { useState } from "react";
import { Calendar, MapPin, Users, Globe, Phone, Edit3, Share2, UserPlus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface TripDetailModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
}

const TripDetailModal = ({ trip, isOpen, onClose }: TripDetailModalProps) => {
  const [activeTab, setActiveTab] = useState("overview");

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {["overview", "itinerary", "collaborators"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-4">
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
            </div>
          )}

          {activeTab === "itinerary" && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Destinations</h4>
              <div className="space-y-3">
                {trip.coordinates.map((location, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-800">{location.name}</h5>
                          <p className="text-gray-600 text-sm">Day {index + 1} - {index + 2}</p>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "collaborators" && (
            <div className="space-y-4">
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
            </div>
          )}

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
