
import { MapPin, Camera, MessageSquare, UserPlus, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Trip {
  name: string;
  destinations: string;
  year: string;
  rating: number;
}

interface Review {
  place: string;
  rating: number;
  text: string;
}

interface Traveler {
  id: string;
  name: string;
  avatar: string;
  location: string;
  totalTrips: number;
  countries: number;
  followers: number;
  following: number;
  bio: string;
  pastTrips: Trip[];
  recentPhotos: string[];
  reviews: Review[];
}

interface TravelerCardProps {
  traveler: Traveler;
  isFollowing: boolean;
  onFollow: (userId: string) => void;
}

const TravelerCard = ({ traveler, isFollowing, onFollow }: TravelerCardProps) => {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-500 to-orange-500 p-4 text-white">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 border-2 border-white">
              <AvatarFallback className="bg-white text-purple-600 font-bold text-lg">
                {traveler.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="text-lg font-bold">{traveler.name}</h4>
              <div className="flex items-center space-x-1 text-sm opacity-90">
                <MapPin size={14} />
                <span>{traveler.location}</span>
              </div>
              <p className="text-sm opacity-90 mt-1">{traveler.bio}</p>
            </div>
            <Button
              size="sm"
              variant={isFollowing ? "secondary" : "outline"}
              className={isFollowing 
                ? "bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-700" 
                : "border-white text-white hover:bg-white hover:text-purple-600"
              }
              onClick={() => onFollow(traveler.id)}
            >
              <UserPlus size={16} className="mr-1" />
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4 text-center">
            <div>
              <p className="font-bold">{traveler.totalTrips}</p>
              <p className="text-xs opacity-80">Trips</p>
            </div>
            <div>
              <p className="font-bold">{traveler.countries}</p>
              <p className="text-xs opacity-80">Countries</p>
            </div>
            <div>
              <p className="font-bold">{traveler.followers}</p>
              <p className="text-xs opacity-80">Followers</p>
            </div>
            <div>
              <p className="font-bold">{traveler.following}</p>
              <p className="text-xs opacity-80">Following</p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-4 space-y-4">
          {/* Recent Photos */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Camera size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Recent Photos</span>
            </div>
            <div className="flex space-x-2">
              {traveler.recentPhotos.map((photo, index) => (
                <div key={index} className="w-12 h-12 bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{photo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Trips */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Past Adventures</span>
            </div>
            <div className="space-y-2">
              {traveler.pastTrips.slice(0, 2).map((trip, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-sm">{trip.name}</h5>
                      <p className="text-xs text-gray-600">{trip.destinations} • {trip.year}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">{trip.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Recent Reviews</span>
            </div>
            <div className="space-y-2">
              {traveler.reviews.slice(0, 1).map((review, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-medium text-sm">{review.place}</h5>
                    <div className="flex items-center space-x-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">"{review.text}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900">
              <MessageSquare size={16} className="mr-1" />
              Message
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900">
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelerCard;
