
import { MapPin, Calendar, Settings, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileSectionProps {
  onSignOut?: () => void;
}

const ProfileSection = ({ onSignOut }: ProfileSectionProps) => {
  const handleSettingsClick = () => {
    console.log("Settings clicked");
  };

  const handleSignOutClick = () => {
    if (onSignOut) {
      onSignOut();
    }
    console.log("Sign out clicked");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-orange-500 text-white text-2xl font-bold">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">John Doe</h2>
              <p className="text-gray-600">Travel Enthusiast</p>
              <div className="flex items-center space-x-2 mt-2">
                <MapPin size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">New York, USA</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travel Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Travel Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600">Countries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">28</p>
              <p className="text-sm text-gray-600">Cities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">5</p>
              <p className="text-sm text-gray-600">Trips</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar size={16} className="text-blue-500" />
              <span className="text-sm text-gray-700">Planned trip to Paris</span>
              <span className="text-xs text-gray-500 ml-auto">2 days ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin size={16} className="text-green-500" />
              <span className="text-sm text-gray-700">Explored Tokyo</span>
              <span className="text-xs text-gray-500 ml-auto">1 week ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button 
          onClick={handleSettingsClick}
          variant="outline" 
          className="w-full flex items-center justify-center space-x-2"
        >
          <Settings size={16} />
          <span>Settings</span>
        </Button>

        <Button 
          onClick={handleSignOutClick}
          variant="destructive" 
          className="w-full flex items-center justify-center space-x-2"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfileSection;
