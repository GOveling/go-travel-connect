
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit } from "lucide-react";

interface ProfileHeaderProps {
  displayName: string;
  initials: string;
  loading: boolean;
  onEditClick?: () => void;
  avatarUrl?: string;
}

const ProfileHeader = ({ displayName, initials, loading, onEditClick, avatarUrl }: ProfileHeaderProps) => {
  if (loading) {
    return (
      <div className="pt-8 pb-4 text-center">
        <Skeleton className="w-24 h-24 mx-auto mb-4 rounded-full" />
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto mb-2" />
        <Skeleton className="h-6 w-24 mx-auto" />
      </div>
    );
  }

  return (
    <div className="pt-8 pb-4 text-center">
      <div className="relative inline-block">
        <Avatar 
          className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={onEditClick}
        >
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt="Profile" />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-orange-500 text-white text-2xl font-bold">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Edit icon overlay */}
        <div 
          className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-all duration-200 hover:scale-110"
          onClick={onEditClick}
        >
          <Edit size={14} />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        {displayName}
      </h2>
      <p className="text-gray-600 mb-2">Travel Enthusiast</p>
      <div className="flex items-center justify-center space-x-2">
        <span className="text-sm bg-gradient-to-r from-blue-500 to-orange-500 text-white px-3 py-1 rounded-full">
          Explorer Level
        </span>
      </div>
    </div>
  );
};

export default ProfileHeader;
