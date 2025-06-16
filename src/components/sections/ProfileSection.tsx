
import { FileText, Bell, Settings, LogOut, Award, Share } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { useTravelStats } from "@/hooks/useTravelStats";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useProfileModals } from "@/hooks/useProfileModals";
import ProfileHeader from "@/components/profile/ProfileHeader";
import TravelStatsCard from "@/components/profile/TravelStatsCard";
import RecentActivityCard from "@/components/profile/RecentActivityCard";
import ProfileMenu from "@/components/profile/ProfileMenu";
import ProfileModals from "@/components/profile/ProfileModals";
import { MenuItemConfig } from "@/types/profile";

interface ProfileSectionProps {
  onSignOut?: () => void;
}

const ProfileSection = ({ onSignOut }: ProfileSectionProps) => {
  const { signOut } = useAuth();
  const { profile, loading: profileLoading, getInitials, user } = useProfileData();
  const { stats, loading: statsLoading } = useTravelStats();
  const { activities, loading: activitiesLoading } = useRecentActivity();
  const modalState = useProfileModals();

  const menuItems: MenuItemConfig[] = [
    { 
      icon: FileText, 
      title: "Travel Documents", 
      subtitle: "Passports, visas, tickets", 
      color: "text-blue-600",
      onClick: () => modalState.setIsTravelDocumentsModalOpen(true)
    },
    { 
      icon: Bell, 
      title: "Notifications", 
      subtitle: "Manage alerts & updates", 
      color: "text-green-600",
      onClick: () => modalState.setIsNotificationsModalOpen(true)
    },
    { 
      icon: Award, 
      title: "Travel Achievements", 
      subtitle: `Level ${stats.level} Explorer • ${stats.achievement_points} points earned`, 
      color: "text-purple-600",
      onClick: () => modalState.setIsTravelAchievementsModalOpen(true)
    },
    { 
      icon: Share, 
      title: "Share Profile", 
      subtitle: "Connect with travelers", 
      color: "text-orange-600",
      onClick: () => modalState.setIsShareProfileModalOpen(true)
    },
    { 
      icon: Settings, 
      title: "Settings", 
      subtitle: "App preferences", 
      color: "text-gray-600",
      onClick: () => modalState.setIsSettingsModalOpen(true)
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    if (onSignOut) {
      onSignOut();
    }
  };

  const displayName = profile?.full_name || user?.email || 'Traveler';

  return (
    <div className="min-h-screen p-4 space-y-6">
      <ProfileHeader 
        displayName={displayName}
        initials={getInitials()}
        loading={profileLoading}
      />

      <TravelStatsCard 
        stats={stats}
        loading={statsLoading}
      />

      <RecentActivityCard 
        activities={activities}
        loading={activitiesLoading}
      />

      <ProfileMenu menuItems={menuItems} />

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

      <ProfileModals {...modalState} />
    </div>
  );
};

export default ProfileSection;
