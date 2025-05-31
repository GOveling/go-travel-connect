
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Camera,
  MessageSquare,
  UserPlus,
  Star,
  Calendar,
  Globe,
  Heart,
  Share2,
  X,
} from "lucide-react";

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

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  traveler: Traveler | null;
  isFollowing: boolean;
  onFollow: (userId: string) => void;
}

const ViewProfileModal = ({
  isOpen,
  onClose,
  traveler,
  isFollowing,
  onFollow,
}: ViewProfileModalProps) => {
  if (!traveler) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header with Cover & Profile */}
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-32 md:h-48 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              >
                <X size={20} />
              </Button>

              {/* Action Buttons */}
              <div className="absolute top-4 left-4 flex space-x-2 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Share2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Heart size={16} />
                </Button>
              </div>
            </div>

            {/* Profile Info Overlay */}
            <div className="absolute -bottom-16 left-6 right-6 flex items-end justify-between">
              <div className="flex items-end space-x-4">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-orange-500 text-white font-bold text-2xl md:text-3xl">
                    {traveler.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="mb-2 text-white">
                  <h2 className="text-xl md:text-2xl font-bold">{traveler.name}</h2>
                  <div className="flex items-center space-x-1 text-sm opacity-90">
                    <MapPin size={14} />
                    <span>{traveler.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mb-2">
                <Button
                  size="sm"
                  variant={isFollowing ? "secondary" : "default"}
                  onClick={() => onFollow(traveler.id)}
                  className={isFollowing 
                    ? "bg-white text-black hover:bg-gray-100" 
                    : "bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                  }
                >
                  <UserPlus size={16} className="mr-1" />
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
                  <MessageSquare size={16} className="mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 px-6 py-4 bg-gray-50 border-b">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="font-bold text-lg text-gray-800">{traveler.totalTrips}</p>
                <p className="text-xs text-gray-600">Trips</p>
              </div>
              <div>
                <p className="font-bold text-lg text-gray-800">{traveler.countries}</p>
                <p className="text-xs text-gray-600">Countries</p>
              </div>
              <div>
                <p className="font-bold text-lg text-gray-800">{traveler.followers}</p>
                <p className="text-xs text-gray-600">Followers</p>
              </div>
              <div>
                <p className="font-bold text-lg text-gray-800">{traveler.following}</p>
                <p className="text-xs text-gray-600">Following</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {/* Bio */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{traveler.bio}</p>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="trips" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="trips">Adventures</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="trips" className="space-y-4">
                  <div className="grid gap-4">
                    {traveler.pastTrips.map((trip, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-gray-800">{trip.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">{trip.destinations}</p>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Calendar size={14} className="text-gray-500" />
                                  <span className="text-sm text-gray-600">{trip.year}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-medium">{trip.rating}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="ml-4">
                              <Globe size={12} className="mr-1" />
                              Adventure
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="photos" className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Camera size={20} className="text-gray-600" />
                      <span className="font-medium text-gray-700">Recent Travel Photos</span>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {traveler.recentPhotos.map((photo, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                        >
                          <span className="text-2xl">{photo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  <div className="space-y-4">
                    {traveler.reviews.map((review, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-gray-800">{review.place}</h5>
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-medium">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 italic">"{review.text}"</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewProfileModal;
