
import { Calendar, MapPin, Users, Edit, UserPlus, Settings, Brain, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStatusDisplayText } from "@/utils/tripStatusUtils";

interface TripCardProps {
  trip: any;
  onViewDetails: (trip: any) => void;
  onEditTrip: (trip: any) => void;
  onInviteFriends: (trip: any) => void;
  onGroupOptions: (trip: any) => void;
  onAISmartRoute: (trip: any) => void;
  onViewSavedPlaces: (trip: any) => void;
}

const TripCard = ({ 
  trip, 
  onViewDetails, 
  onEditTrip, 
  onInviteFriends, 
  onGroupOptions, 
  onAISmartRoute, 
  onViewSavedPlaces 
}: TripCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "traveling":
        return "bg-purple-100 text-purple-800";
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
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-20 h-16 sm:h-auto bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl">{trip.image}</span>
          </div>
          <div className="flex-1 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <h3 className="font-semibold text-lg">{trip.name}</h3>
                {trip.isGroupTrip && (
                  <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full w-fit">
                    <Users size={12} className="text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">Group</span>
                  </div>
                )}
              </div>
              <div className="flex flex-row sm:flex-col items-start sm:items-end space-x-2 sm:space-x-0 sm:space-y-1">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(trip.status)}`}>
                  {getStatusDisplayText(trip.status)}
                </span>
                {trip.isGroupTrip && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGroupOptions(trip)}
                    className="text-xs px-2 sm:px-3 py-2 h-8 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 min-w-[90px] sm:min-w-auto"
                  >
                    <Settings size={12} className="mr-1" />
                    <span>Group Options</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Collaborators for group trips */}
            {trip.collaborators && trip.collaborators.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Users size={14} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Collaborators:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trip.collaborators.slice(0, 2).map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center space-x-1 bg-white border rounded-lg px-2 py-1">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-xs text-white">
                        {collaborator.avatar}
                      </div>
                      <span className="text-xs text-gray-700 hidden sm:inline">{collaborator.name}</span>
                      <span className="text-xs text-gray-700 sm:hidden">{collaborator.name.split(' ')[0]}</span>
                      <span className={`text-xs px-1 py-0.5 rounded-full ${getRoleColor(collaborator.role)}`}>
                        {collaborator.role}
                      </span>
                    </div>
                  ))}
                  {trip.collaborators.length > 2 && (
                    <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded-full">
                      <span className="text-xs text-gray-600">+{trip.collaborators.length - 2}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm text-gray-600 mb-3">
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="flex-shrink-0" />
                <span className="truncate">{trip.destination}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="flex-shrink-0" />
                <span className="text-xs sm:text-sm">{trip.dates}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={16} className="flex-shrink-0" />
                <span>{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* My Saved Places Button */}
            <div className="mb-3">
              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 text-sm sm:text-base"
                onClick={() => onViewSavedPlaces(trip)}
              >
                <Bookmark size={20} className="mr-2" />
                My saved places
              </Button>
            </div>

            {/* AI Smart Route Button for All Trips */}
            <div className="mb-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAISmartRoute(trip)}
                className="w-full bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 hover:text-purple-800 text-xs sm:text-sm"
              >
                <Brain size={16} className="mr-2" />
                AI Smart Route
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 text-xs sm:text-sm"
                onClick={() => onEditTrip(trip)}
              >
                <Edit size={16} className="mr-1" />
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 text-xs sm:text-sm"
                onClick={() => onInviteFriends(trip)}
              >
                <UserPlus size={16} className="mr-1" />
                <span className="hidden sm:inline">Invite Friends</span>
                <span className="sm:hidden">Invite</span>
              </Button>
              <Button 
                size="lg" 
                className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500 text-sm sm:text-base px-4 py-3"
                onClick={() => onViewDetails(trip)}
              >
                <span className="hidden sm:inline">Trip plan details</span>
                <span className="sm:hidden">Trip details</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
