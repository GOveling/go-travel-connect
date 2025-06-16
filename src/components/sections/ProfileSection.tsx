
import { User, FileText, Bell, Settings, LogOut, Camera, Award, Share, Share2, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import TravelDocumentsModal from "@/components/modals/TravelDocumentsModal";
import NotificationsModal from "@/components/modals/NotificationsModal";
import TravelAchievementsModal from "@/components/modals/TravelAchievementsModal";
import ShareProfileModal from "@/components/modals/ShareProfileModal";
import SettingsModal from "@/components/modals/SettingsModal";
import { calculateTripStatus } from "@/utils/tripStatusUtils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProfileSectionProps {
  onSignOut: () => void;
  user: any;
  onEditProfile: () => void;
  onShareProfile: () => void;
  onTravelAchievements: () => void;
  onApiTest?: () => void;
}

export const ProfileSection = ({
  onSignOut,
  user,
  onEditProfile,
  onShareProfile,
  onTravelAchievements,
  onApiTest,
}: ProfileSectionProps) => {
  const { user: authUser, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isTravelDocumentsModalOpen, setIsTravelDocumentsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isTravelAchievementsModalOpen, setIsTravelAchievementsModalOpen] = useState(false);
  const [isShareProfileModalOpen, setIsShareProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  // Mock trips data to calculate places visited from completed trips
  const userTrips = [
    {
      id: 1,
      name: "European Adventure",
      dates: "Sep 15 - Sep 25, 2024",
      savedPlaces: [
        { name: "Eiffel Tower", location: "Paris" },
        { name: "Louvre Museum", location: "Paris" },
        { name: "Colosseum", location: "Rome" },
        { name: "Vatican City", location: "Rome" },
        { name: "Sagrada Familia", location: "Barcelona" }
      ]
    },
    {
      id: 2,
      name: "Bali Retreat",
      dates: "Nov 20 - Nov 27, 2024",
      savedPlaces: [
        { name: "Tanah Lot Temple", location: "Bali" },
        { name: "Ubud Rice Terraces", location: "Bali" },
        { name: "Mount Batur", location: "Bali" }
      ]
    },
    {
      id: 3,
      name: "Tokyo Discovery",
      dates: "Jan 8 - Jan 15, 2025",
      savedPlaces: [
        { name: "Tokyo Tower", location: "Tokyo" },
        { name: "Senso-ji Temple", location: "Tokyo" }
      ]
    }
  ];

  // Calculate places visited from completed trips
  const completedTrips = userTrips.filter(trip => calculateTripStatus(trip.dates) === 'completed');
  const placesVisited = completedTrips.reduce((total, trip) => total + trip.savedPlaces.length, 0);

  const menuItems = [
    { 
      icon: FileText, 
      title: "Travel Documents", 
      subtitle: "Passports, visas, tickets", 
      color: "text-blue-600",
      onClick: () => setIsTravelDocumentsModalOpen(true)
    },
    { 
      icon: Bell, 
      title: "Notifications", 
      subtitle: "Manage alerts & updates", 
      color: "text-green-600",
      onClick: () => setIsNotificationsModalOpen(true)
    },
    { 
      icon: Award, 
      title: "Travel Achievements", 
      subtitle: "Level 5 Explorer • 12 badges earned", 
      color: "text-purple-600",
      onClick: () => setIsTravelAchievementsModalOpen(true)
    },
    { 
      icon: Share, 
      title: "Share Profile", 
      subtitle: "Connect with travelers", 
      color: "text-orange-600",
      onClick: () => setIsShareProfileModalOpen(true)
    },
    { 
      icon: Settings, 
      title: "Settings", 
      subtitle: "App preferences", 
      color: "text-gray-600",
      onClick: () => setIsSettingsModalOpen(true)
    },
  ];

  const stats = [
    { label: "Countries Visited", value: "8" },
    { label: "Cities Explored", value: "24" },
    { label: "Places Visited", value: placesVisited.toString() },
    { label: "Achievement Points", value: "1,250" },
  ];

  const handleSignOut = async () => {
    await signOut();
    if (onSignOut) {
      onSignOut();
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="pt-8 pb-4 text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-orange-500 text-white text-2xl font-bold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {profile?.full_name || user?.email || 'Traveler'}
        </h2>
        <p className="text-gray-600 mb-2">Travel Enthusiast</p>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm bg-gradient-to-r from-blue-500 to-orange-500 text-white px-3 py-1 rounded-full">
            Explorer Level
          </span>
        </div>
      </div>

      {/* Travel Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-center">Travel Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Added photos from Paris</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Award size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Earned "City Explorer" badge</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onEditProfile}
            className="h-12 flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            onClick={onShareProfile}
            className="h-12 flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Profile
          </Button>
          <Button
            variant="outline"
            onClick={onTravelAchievements}
            className="h-12 flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Achievements
          </Button>
          {onApiTest && (
            <Button
              variant="outline"
              onClick={onApiTest}
              className="h-12 flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Test API
            </Button>
          )}
        </div>
      </div>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Notifications</p>
            <div className="text-sm text-blue-600">Enabled</div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Language</p>
            <div className="text-sm text-gray-800">English</div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border-red-200">
        <CardContent className="p-4">
          <Button 
            variant="ghost" 
            className="w-full text-red-600 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut size={20} className="mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Travel Achievements Modal */}
      <TravelAchievementsModal
        isOpen={isTravelAchievementsModalOpen}
        onClose={() => setIsTravelAchievementsModalOpen(false)}
      />

      {/* Share Profile Modal */}
      <ShareProfileModal
        isOpen={isShareProfileModalOpen}
        onClose={() => setIsShareProfileModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Travel Documents Modal */}
      <TravelDocumentsModal
        isOpen={isTravelDocumentsModalOpen}
        onClose={() => setIsTravelDocumentsModalOpen(false)}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />
    </div>
  );
};

export default ProfileSection;
