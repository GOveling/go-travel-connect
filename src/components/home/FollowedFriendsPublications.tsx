
import { Users, Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";

interface FriendUpdate {
  id: string;
  friendName: string;
  friendAvatar: string;
  action: 'saved' | 'visited' | 'posted';
  placeName?: string;
  location?: string;
  images?: string[];
  text?: string;
  timestamp: Date;
  likes: number;
  comments: number;
}

interface FollowedFriendsPublicationsProps {
  updates: FriendUpdate[];
  onViewAllUpdates: () => void;
}

const FollowedFriendsPublications = ({ 
  updates, 
  onViewAllUpdates 
}: FollowedFriendsPublicationsProps) => {
  const { t } = useLanguage();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return t("home.recentActivity.timeAgo.hoursAgo", { count: diffInHours });
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return t("home.recentActivity.timeAgo.daysAgo", { count: diffInDays });
    }
  };

  const getUpdateText = (update: FriendUpdate) => {
    switch (update.action) {
      case 'saved':
        return t("home.followedFriends.friendSaved", { 
          friendName: update.friendName, 
          placeName: update.placeName 
        });
      case 'visited':
        return t("home.followedFriends.friendVisited", { 
          friendName: update.friendName, 
          placeName: update.placeName 
        });
      case 'posted':
        return t("home.followedFriends.friendPosted", { 
          friendName: update.friendName, 
          location: update.location 
        });
      default:
        return `${update.friendName} shared an update`;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">{t("home.followedFriends.title")}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewAllUpdates}>
          <Users size={16} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.length === 0 ? (
          <div className="text-center py-8">
            <Users size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">{t("home.followedFriends.noUpdates")}</p>
            <p className="text-xs text-gray-400">
              {t("home.followedFriends.followFriends")}
            </p>
          </div>
        ) : (
          updates.slice(0, 3).map((update) => (
            <div key={update.id} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-start space-x-3">
                <img
                  src={update.friendAvatar}
                  alt={update.friendName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {getUpdateText(update)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(update.timestamp)}
                  </p>
                </div>
              </div>
              
              {update.images && update.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {update.images.slice(0, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Update image ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              
              {update.text && (
                <p className="text-sm text-gray-700">{update.text}</p>
              )}
              
              <div className="flex items-center space-x-4 pt-2">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                  <Heart size={14} />
                  <span className="text-xs">{update.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageCircle size={14} />
                  <span className="text-xs">{update.comments}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
        {updates.length > 3 && (
          <Button variant="outline" className="w-full" onClick={onViewAllUpdates}>
            {t("home.followedFriends.viewAllUpdates")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default FollowedFriendsPublications;
