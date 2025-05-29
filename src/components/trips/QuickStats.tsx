
import { Card, CardContent } from "@/components/ui/card";

interface QuickStatsProps {
  trips: any[];
}

const QuickStats = ({ trips }: QuickStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <Card className="text-center">
        <CardContent className="p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-blue-600">{trips.length}</p>
          <p className="text-xs sm:text-sm text-gray-600">Total Trips</p>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-green-600">{trips.filter(t => t.status === 'upcoming').length}</p>
          <p className="text-xs sm:text-sm text-gray-600">Upcoming</p>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-orange-600">{trips.filter(t => t.isGroupTrip).length}</p>
          <p className="text-xs sm:text-sm text-gray-600">Group Trips</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
