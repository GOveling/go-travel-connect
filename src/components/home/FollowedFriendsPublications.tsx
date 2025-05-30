
import { MapPin, Heart, MessageCircle, Share2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import PublicationPhotosModal from "@/components/modals/PublicationPhotosModal";
import ExploreAddToTripModal from "@/components/modals/ExploreAddToTripModal";

interface FriendPublication {
  id: string;
  friendName: string;
  friendAvatar?: string;
  images: string[];
  text: string;
  createdAt: number;
  location?: string;
  likes: number;
  comments: number;
  liked: boolean;
}

interface FollowedFriendsPublicationsProps {
  publications: FriendPublication[];
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  formatTimeAgo: (timestamp: number) => string;
  trips?: any[];
  onAddToExistingTrip?: (tripId: number, place: any) => void;
  onCreateNewTrip?: (tripData: any) => void;
}

const FollowedFriendsPublications = ({
  publications,
  onLike,
  onComment,
  onShare,
  formatTimeAgo,
  trips = [],
  onAddToExistingTrip = () => {},
  onCreateNewTrip = () => {}
}: FollowedFriendsPublicationsProps) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedFriendName, setSelectedFriendName] = useState("");
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  // Extract the first and most visible initial from name
  const getInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const handleImageClick = (images: string[], imageIndex: number, friendName: string) => {
    setSelectedImages(images);
    setSelectedImageIndex(imageIndex);
    setSelectedFriendName(friendName);
    setIsPhotosModalOpen(true);
  };

  const handleAddToTripClick = (publication: FriendPublication, e: React.MouseEvent) => {
    e.stopPropagation();
    if (publication.location) {
      const place = {
        name: publication.location,
        location: publication.location,
        rating: 4.5,
        image: publication.images[0] || "📍",
        category: "recommended",
        description: `Recommended by ${publication.friendName}: ${publication.text}`,
        lat: 0,
        lng: 0
      };
      setSelectedPlace(place);
      setIsAddToTripModalOpen(true);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Friends' Publications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {publications.length === 0 ? (
            <div className="text-center py-8">
              <Share2 size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No friend publications yet</p>
              <p className="text-xs text-gray-400">Follow more friends to see their travel memories!</p>
            </div>
          ) : (
            publications.map((publication) => (
              <div key={publication.id} className="border rounded-lg p-3 space-y-3">
                {/* Friend info */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {publication.friendAvatar ? (
                      <AvatarImage src={publication.friendAvatar} alt={publication.friendName} />
                    ) : (
                      <AvatarFallback>{getInitials(publication.friendName)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{publication.friendName}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(publication.createdAt)}</p>
                  </div>
                </div>
                
                {/* Publication content */}
                <p className="text-sm text-gray-700">{publication.text}</p>
                
                {/* Images */}
                <div className="grid grid-cols-2 gap-2">
                  {publication.images.slice(0, 2).map((image, index) => (
                    <div key={index} className="relative group">
                      <button
                        onClick={() => handleImageClick(publication.images, index, publication.friendName)}
                        className="w-full h-32 rounded overflow-hidden hover:scale-105 transition-transform duration-200"
                      >
                        <img
                          src={image}
                          alt={`Publication image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      {publication.location && (
                        <Button
                          size="sm"
                          onClick={(e) => handleAddToTripClick(publication, e)}
                          className="absolute top-2 right-2 h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                          variant="ghost"
                        >
                          <Plus size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                  {publication.images.length > 2 && (
                    <div className="relative col-span-2 group">
                      <button
                        onClick={() => handleImageClick(publication.images, 2, publication.friendName)}
                        className="w-full h-32 rounded overflow-hidden hover:scale-105 transition-transform duration-200"
                      >
                        <img
                          src={publication.images[2]}
                          alt="More images"
                          className="w-full h-full object-cover"
                        />
                        {publication.images.length > 3 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              +{publication.images.length - 3} more
                            </span>
                          </div>
                        )}
                      </button>
                      {publication.location && (
                        <Button
                          size="sm"
                          onClick={(e) => handleAddToTripClick(publication, e)}
                          className="absolute top-2 right-2 h-7 w-7 p-0 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
                          variant="ghost"
                        >
                          <Plus size={14} />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Location */}
                {publication.location && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <MapPin size={12} />
                    <span>{publication.location}</span>
                  </div>
                )}
                
                {/* Interaction buttons */}
                <div className="flex justify-between pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`flex gap-1 ${publication.liked ? 'text-red-500' : ''}`}
                    onClick={() => onLike(publication.id)}
                  >
                    <Heart size={16} className={publication.liked ? 'fill-current' : ''} />
                    <span>{publication.likes}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex gap-1"
                    onClick={() => onComment(publication.id)}
                  >
                    <MessageCircle size={16} />
                    <span>{publication.comments}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onShare(publication.id)}
                  >
                    <Share2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <PublicationPhotosModal
        isOpen={isPhotosModalOpen}
        onClose={() => setIsPhotosModalOpen(false)}
        images={selectedImages}
        initialIndex={selectedImageIndex}
        friendName={selectedFriendName}
      />

      <ExploreAddToTripModal
        isOpen={isAddToTripModalOpen}
        onClose={() => setIsAddToTripModalOpen(false)}
        selectedPlace={selectedPlace}
        existingTrips={trips}
        onAddToExistingTrip={onAddToExistingTrip}
        onCreateNewTrip={onCreateNewTrip}
      />
    </>
  );
};

export default FollowedFriendsPublications;
