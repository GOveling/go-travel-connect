import ProfileContent from "@/components/profile/ProfileContent";

interface ProfileSectionProps {
  onSignOut?: () => void;
}

const ProfileSection = ({ onSignOut }: ProfileSectionProps) => {
  return (
    <div className="min-h-screen p-4">
      <ProfileContent onSignOut={onSignOut} />
    </div>
  );
};

export default ProfileSection;
