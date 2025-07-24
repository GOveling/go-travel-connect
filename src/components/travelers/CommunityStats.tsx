import { Card, CardContent } from "@/components/ui/card";

const CommunityStats = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="text-center">
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-purple-600">2.5K</p>
          <p className="text-xs text-gray-600">Active Travelers</p>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-orange-600">8.7K</p>
          <p className="text-xs text-gray-600">Shared Trips</p>
        </CardContent>
      </Card>
      <Card className="text-center">
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-green-600">15K</p>
          <p className="text-xs text-gray-600">Reviews</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityStats;
