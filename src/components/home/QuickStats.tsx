
import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const QuickStats = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
        <CardContent className="p-4 text-center">
          <MapPin className="mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold">12</p>
          <p className="text-sm opacity-90">Places Saved</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
        <CardContent className="p-4 text-center">
          <Calendar className="mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold">3</p>
          <p className="text-sm opacity-90">Upcoming Trips</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
