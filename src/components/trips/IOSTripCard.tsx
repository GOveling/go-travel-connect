
import React from 'react';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { IOSCard } from '@/components/ui/ios-card';
import { Badge } from '@/components/ui/badge';
import type { Trip } from '@/types';

interface IOSTripCardProps {
  trip: Trip;
  onViewDetails: (trip: Trip) => void;
}

const IOSTripCard = ({ trip, onViewDetails }: IOSTripCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-800 border-green-200";
      case "planning":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTotalTravelers = () => {
    if (trip.isGroupTrip && trip.collaborators) {
      return trip.collaborators.length + 1;
    }
    return trip.travelers;
  };

  return (
    <IOSCard 
      className="p-0 hover:shadow-md active:scale-98 transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails(trip)}
    >
      <div className="flex items-center p-4">
        {/* Trip Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
          <span className="text-xl">{trip.image}</span>
        </div>

        {/* Trip Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {trip.name}
            </h3>
            <Badge className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(trip.status)}`}>
              {trip.status}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin size={14} className="mr-2 flex-shrink-0" />
              <span className="truncate">{trip.destination}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar size={14} className="mr-2 flex-shrink-0" />
                <span>{trip.dates}</span>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm">
                <Users size={14} className="mr-1" />
                <span>{getTotalTravelers()}</span>
              </div>
            </div>
          </div>

          {/* Group Collaborators Preview */}
          {trip.isGroupTrip && trip.collaborators && trip.collaborators.length > 0 && (
            <div className="flex items-center mt-3">
              <div className="flex -space-x-2">
                {trip.collaborators.slice(0, 3).map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white"
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
              <span className="text-xs text-gray-500 ml-2">Team</span>
            </div>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight size={20} className="text-gray-400 ml-2 flex-shrink-0" />
      </div>
    </IOSCard>
  );
};

export default IOSTripCard;
