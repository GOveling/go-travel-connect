import { Home, Compass, Briefcase, Calendar, User } from 'lucide-react';

interface BottomNavigationProps {
  activeSection: string;
  onChangeSection: (section: string) => void;
}

export function BottomNavigation({ activeSection, onChangeSection }: BottomNavigationProps) {
  const navItems = [
    {
      icon: Home,
      label: "Home",
      id: "home"
    },
    {
      icon: Compass,
      label: "Explore",
      id: "explore"
    },
    {
      icon: Briefcase,
      label: "My Trips",
      id: "my-trips"
    },
    {
      icon: Calendar,
      label: "Booking",
      id: "booking"
    },
    {
      icon: User,
      label: "Profile",
      id: "profile"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t flex items-center justify-around p-2 z-50">
      {navItems.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activeSection === item.id}
          onClick={() => onChangeSection(item.id)}
        />
      ))}
    </div>
  );
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <button 
      className={`flex flex-col items-center justify-center p-1 ${
        active ? 'text-primary' : 'text-muted-foreground'
      }`} 
      onClick={onClick}
    >
      <Icon size={20} />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}

export default BottomNavigation;
