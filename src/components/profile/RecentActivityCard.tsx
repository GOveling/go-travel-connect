
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityItem } from "@/types/profile";
import { Camera, Award, MapPin, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityCardProps {
  activities: ActivityItem[];
  loading: boolean;
}

const iconMap = {
  Camera,
  Award,
  MapPin,
  Calendar,
};

const RecentActivityCard = ({ activities, loading }: RecentActivityCardProps) => {
  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Camera;
  };

  const getIconColor = (activityType: string) => {
    switch (activityType) {
      case 'trip_completed':
        return 'text-green-600 bg-green-100';
      case 'photo_added':
        return 'text-blue-600 bg-blue-100';
      case 'achievement_earned':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.slice(0, 2).map((activity) => {
            const Icon = getIcon(activity.icon);
            const colorClass = getIconColor(activity.activity_type);
            
            return (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No recent activity</p>
            <p className="text-xs text-gray-400">Start exploring to see your activity here!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
