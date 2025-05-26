
import { MapPin, Calendar, Camera, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import NotificationAlertsModal from "@/components/modals/NotificationAlertsModal";

const HomeSection = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(5); // Example count for new notifications

  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotificationCount(0);
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header with Notification Bell */}
      <div className="text-center pt-8 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1"></div>
          <div className="flex justify-center flex-1">
            <img 
              src="/lovable-uploads/3e9a8a6e-d543-437e-a44d-2f16fac6303f.png" 
              alt="GOveling Logo" 
              className="h-24 w-auto"
            />
          </div>
          <div className="flex-1 flex justify-end">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotificationClick}
                className="relative p-2 hover:bg-gray-100 rounded-full"
              >
                <Bell size={24} className="text-gray-600" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
        <p className="text-gray-600 mt-2">Your smart travel companion</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
          <CardContent className="p-4 text-center">
            <MapPin className="mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm opacity-90">Places Saved</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <Calendar className="mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm opacity-90">Upcoming Trips</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Trip */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-4 text-white">
          <h3 className="font-semibold">Current Trip</h3>
          <p className="text-sm opacity-90">Paris, France</p>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-600">Day 2 of 7</p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 h-2 rounded-full w-2/7"></div>
          </div>
          <p className="text-sm text-gray-700 mb-3">Next: Visit Louvre Museum</p>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-orange-500 border-0 hover:from-purple-700 hover:to-orange-600">
            View Itinerary
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-16 flex-col space-y-1 border-2 border-purple-200 hover:bg-purple-50 text-purple-700">
          <Bell size={20} />
          <span className="text-sm">Nearby Alerts</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col space-y-1 border-2 border-orange-200 hover:bg-orange-50 text-orange-700">
          <Camera size={20} />
          <span className="text-sm">Add Memory</span>
        </Button>
      </div>

      {/* Recent Activity */}
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

      <NotificationAlertsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notificationCount={notificationCount}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />
    </div>
  );
};

export default HomeSection;
