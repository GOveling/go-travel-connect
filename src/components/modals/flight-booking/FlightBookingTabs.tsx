
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FlightBookingTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const FlightBookingTabs = ({ activeTab, onTabChange }: FlightBookingTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search">Search Flights</TabsTrigger>
        <TabsTrigger value="my-flights">My Flights</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default FlightBookingTabs;
