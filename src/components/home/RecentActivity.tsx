import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <MapPin size={16} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Saved Eiffel Tower</p>
            <p className="text-xs text-gray-500">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Calendar size={16} className="text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Booked hotel in Rome</p>
            <p className="text-xs text-gray-500">1 day ago</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
