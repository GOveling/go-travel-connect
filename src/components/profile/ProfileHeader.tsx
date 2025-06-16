
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileHeaderProps {
  displayName: string;
  initials: string;
  loading: boolean;
}

const ProfileHeader = ({ displayName, initials, loading }: ProfileHeaderProps) => {
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
      <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-orange-500 text-white text-2xl font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
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
