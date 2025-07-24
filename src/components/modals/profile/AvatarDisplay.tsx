import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarDisplayProps {
  currentAvatarUrl: string;
  initials: string;
}

const AvatarDisplay = ({ currentAvatarUrl, initials }: AvatarDisplayProps) => {
  return (
    <div className="relative">
      <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
        {currentAvatarUrl ? (
          <AvatarImage src={currentAvatarUrl} alt="Profile" />
        ) : (
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-orange-500 text-white text-2xl font-bold">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
    </div>
  );
};

export default AvatarDisplay;
