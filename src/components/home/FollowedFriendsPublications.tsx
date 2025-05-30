
import { MapPin, Heart, MessageCircle, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useState } from "react";

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
}

const FollowedFriendsPublications = ({
  publications,
  onLike,
  onComment,
  onShare,
  formatTimeAgo
}: FollowedFriendsPublicationsProps) => {
  // Extract the first and most visible initial from name
  const getInitials = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  const ImageCarousel = ({ images }: { images: string[] }) => {
    if (images.length === 1) {
      return (
        <img
          src={images[0]}
          alt="Publication image"
          className="w-full h-48 object-cover rounded"
        />
      );
    }

    return (
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <img
                src={image}
                alt={`Publication image ${index + 1}`}
                className="w-full h-48 object-cover rounded"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>
    );
  };
  
  return (
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
              
              {/* Images Carousel */}
              <ImageCarousel images={publication.images} />
              
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
  );
};

export default FollowedFriendsPublications;
