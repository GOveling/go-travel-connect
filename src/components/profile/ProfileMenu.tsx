
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuItemConfig } from "@/types/profile";

interface ProfileMenuProps {
  menuItems: MenuItemConfig[];
}

const ProfileMenu = ({ menuItems }: ProfileMenuProps) => {
  return (
    <div className="space-y-3">
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Icon size={20} className={item.color} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={item.onClick}
                >
                  →
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProfileMenu;
