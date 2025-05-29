
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CurrentTripProps {
  onViewDetail?: () => void;
}

const CurrentTrip = ({ onViewDetail }: CurrentTripProps) => {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-4 text-white">
        <h3 className="font-semibold">Current Trip</h3>
        <p className="text-sm opacity-90">Paris, France</p>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-gray-600">Day 2 of 7</p>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div className="bg-gradient-to-r from-purple-600 to-orange-500 h-2 rounded-full w-2/7"></div>
        </div>
        <p className="text-sm text-gray-700 mb-3">Next: Visit Louvre Museum</p>
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-orange-500 border-0 hover:from-purple-700 hover:to-orange-600"
          onClick={onViewDetail}
        >
          View Detail
        </Button>
      </CardContent>
    </Card>
  );
};

export default CurrentTrip;
