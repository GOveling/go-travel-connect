import { Calendar, MapPin, Users, UserPlus, Share2, Edit3, Route, Heart, MoreHorizontal, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTripImageGeneration } from "@/hooks/useTripImageGeneration";
import { useEffect, useState } from "react";
import type { Trip, TripCardProps } from '@/types';

const TripCard = ({
  trip,
  onViewDetails,
  onEditTrip,
  onInviteFriends,
  onGroupOptions,
  onAISmartRoute,
  onViewSavedPlaces
}: TripCardProps) => {
  const { generateTripImage, getTripImage, isGenerating } = useTripImageGeneration();
  const [tripImage, setTripImage] = useState<string | null>(null);

  // Generate or get cached trip image
  useEffect(() => {
    const cachedImage = getTripImage(trip.destination, trip.name);
    if (cachedImage) {
      setTripImage(cachedImage);
    } else {
      // Generate image asynchronously
      generateTripImage(trip.destination, trip.name).then(imageUrl => {
        if (imageUrl) {
          setTripImage(imageUrl);
        }
      });
    }
  }, [trip.destination, trip.name, generateTripImage, getTripImage]);

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

  // Calculate total travelers for group trips
  const getTotalTravelers = () => {
    if (trip.isGroupTrip && trip.collaborators) {
      // For group trips, count collaborators + 1 (the user)
      return trip.collaborators.length + 1;
    }
    // For solo trips, use the original travelers count
    return trip.travelers;
  };

  const totalTravelers = getTotalTravelers();

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Trip Image/Icon - Now with AI-generated images */}
          <div className="w-full md:w-32 h-32 md:h-auto relative overflow-hidden">
            {tripImage ? (
              <img 
                src={tripImage} 
                alt={`${trip.destination} - ${trip.name}`}
                className="w-full h-full object-cover"
                onError={() => {
                  // Fallback to emoji if image fails to load
                  setTripImage(null);
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center relative">
                {isGenerating(trip.destination, trip.name) ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span className="text-4xl md:text-5xl">{trip.image}</span>
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 rounded-full p-1">
                      <ImageIcon size={12} className="text-white" />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Trip Content */}
          <div className="flex-1 p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 truncate">
                      {trip.name}
                    </h3>
                    <Badge className={`text-xs px-2 py-1 rounded-full ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </Badge>
                    {trip.isGroupTrip && (
                      <Button
                        onClick={() => onGroupOptions(trip)}
                        className="flex items-center space-x-1 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded-full h-auto"
                        variant="ghost"
                      >
                        <Users size={12} className="text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">Group</span>
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin size={14} />
                      <span className="truncate">{trip.destination}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>{trip.dates}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={14} />
                      <span>{totalTravelers} traveler{totalTravelers > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onViewDetails(trip)}>
                      <Edit3 size={14} className="mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditTrip(trip)}>
                      <Edit3 size={14} className="mr-2" />
                      Edit Trip
                    </DropdownMenuItem>
                    {trip.isGroupTrip ? (
                      <>
                        <DropdownMenuItem onClick={() => onGroupOptions(trip)}>
                          <Users size={14} className="mr-2" />
                          Group Options
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onInviteFriends(trip)}>
                          <UserPlus size={14} className="mr-2" />
                          Manage Team
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem onClick={() => onInviteFriends(trip)}>
                        <UserPlus size={14} className="mr-2" />
                        Add Collaborators
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Share2 size={14} className="mr-2" />
                      Share Trip
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Collaborators Preview */}
              {trip.isGroupTrip && trip.collaborators && trip.collaborators.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Team:</span>
                  <div className="flex -space-x-1">
                    {trip.collaborators.slice(0, 3).map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="w-6 h-6 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white"
                        title={collaborator.name}
                      >
                        {collaborator.avatar}
                      </div>
                    ))}
                    {trip.collaborators.length > 3 && (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                        +{trip.collaborators.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons - Now showing three buttons instead of four */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-sm"
                    onClick={() => onViewDetails(trip)}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 text-sm"
                    onClick={() => onViewSavedPlaces(trip)}
                  >
                    <Heart size={14} className="mr-1" />
                    Saved Places
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50 text-sm"
                    onClick={() => onAISmartRoute(trip)}
                  >
                    <Route size={14} className="mr-1" />
                    AI Smart Route
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
