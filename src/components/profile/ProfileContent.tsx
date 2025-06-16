
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { useTravelStats } from "@/hooks/useTravelStats";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useProfileModals } from "@/hooks/useProfileModals";
import { useProfileMenuConfig } from "./ProfileMenuConfig";
import ProfileHeader from "./ProfileHeader";
import TravelStatsCard from "./TravelStatsCard";
import RecentActivityCard from "./RecentActivityCard";
import ProfileMenu from "./ProfileMenu";
import ProfileModals from "./ProfileModals";
import ProfileActions from "./ProfileActions";

interface ProfileContentProps {
  onSignOut?: () => void;
}

const ProfileContent = ({ onSignOut }: ProfileContentProps) => {
  const { signOut } = useAuth();
  const { profile, loading: profileLoading, getInitials, user } = useProfileData();
  const { stats, loading: statsLoading } = useTravelStats();
  const { activities, loading: activitiesLoading } = useRecentActivity();
  const modalState = useProfileModals();

  const menuItems = useProfileMenuConfig({ stats, modalState });

  const handleSignOut = async () => {
    await signOut();
    if (onSignOut) {
      onSignOut();
    }
  };

  const displayName = profile?.full_name || user?.email || 'Traveler';

  return (
    <div className="space-y-6">
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

      <ProfileActions onSignOut={handleSignOut} />

      <ProfileModals {...modalState} />
    </div>
  );
};

export default ProfileContent;
