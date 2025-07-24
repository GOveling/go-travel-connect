import { Plane, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickBookSectionProps {
  onFlightClick: () => void;
  onHotelClick: () => void;
}

const QuickBookSection = ({
  onFlightClick,
  onHotelClick,
}: QuickBookSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Book</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-left justify-start"
          onClick={onFlightClick}
        >
          <Plane className="mr-3" size={20} />
          <div>
            <p className="font-medium">Round-trip Flight</p>
            <p className="text-xs opacity-90">From $299</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className="w-full h-14 text-left justify-start border-2"
          onClick={onHotelClick}
        >
          <Building className="mr-3" size={20} />
          <div>
            <p className="font-medium">Hotel + Flight Package</p>
            <p className="text-xs text-gray-600">Save up to 40%</p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickBookSection;
