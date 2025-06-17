
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onNotificationsClick: () => void;
  onSearchClick: () => void;
  onProfileClick: () => void;
}

const Header = ({ onNotificationsClick, onSearchClick, onProfileClick }: HeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            TravelApp
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            className="text-gray-600 hover:text-gray-900"
          >
            <Search size={20} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationsClick}
            className="text-gray-600 hover:text-gray-900"
          >
            <Bell size={20} />
          </Button>

          <Button
            variant="ghost"
            className="p-0 h-auto"
            onClick={onProfileClick}
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-orange-500 text-white text-sm font-bold">
                JD
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
