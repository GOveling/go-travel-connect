
import { Plane, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GradientButton from "@/components/ui/gradient-button";

interface QuickBookSectionProps {
  onFlightClick: () => void;
  onHotelClick: () => void;
}

const QuickBookSection = ({ onFlightClick, onHotelClick }: QuickBookSectionProps) => {
  return (
    <Card className="bg-transparent border-0">
      <CardHeader>
        <CardTitle className="text-lg text-white">Quick Book</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <GradientButton 
          className="w-full h-14 text-left justify-start"
          onClick={onFlightClick}
        >
          <Plane className="mr-3" size={20} />
          <div>
            <p className="font-medium">Round-trip Flight</p>
            <p className="text-xs opacity-90">From $299</p>
          </div>
        </GradientButton>
        <GradientButton 
          variant="secondary" 
          className="w-full h-14 text-left justify-start border-2"
          onClick={onHotelClick}
        >
          <Building className="mr-3" size={20} />
          <div>
            <p className="font-medium">Hotel + Flight Package</p>
            <p className="text-xs opacity-90">Save up to 40%</p>
          </div>
        </GradientButton>
      </CardContent>
    </Card>
  );
};

export default QuickBookSection;
