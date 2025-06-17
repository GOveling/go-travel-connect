
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TripTemplatesProps {
  onBeachVacation: () => void;
  onMountainTrip: () => void;
  onCityBreak: () => void;
  onBackpacking: () => void;
}

const TripTemplates = ({ 
  onBeachVacation, 
  onMountainTrip, 
  onCityBreak, 
  onBackpacking 
}: TripTemplatesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Quick Trip Templates</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:gap-3">
        <Button 
          variant="outline" 
          className="h-12 sm:h-16 flex-col space-y-1 border-2 border-blue-200 hover:bg-blue-50 hover:text-black"
          onClick={onBeachVacation}
        >
          <span className="text-lg sm:text-xl">🏖️</span>
          <span className="text-xs sm:text-sm">Beach Vacation</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-12 sm:h-16 flex-col space-y-1 border-2 border-green-200 hover:bg-green-50 hover:text-black"
          onClick={onMountainTrip}
        >
          <span className="text-lg sm:text-xl">🏔️</span>
          <span className="text-xs sm:text-sm">Mountain Trip</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-12 sm:h-16 flex-col space-y-1 border-2 border-purple-200 hover:bg-purple-50 hover:text-black"
          onClick={onCityBreak}
        >
          <span className="text-lg sm:text-xl">🏛️</span>
          <span className="text-xs sm:text-sm">City Break</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-12 sm:h-16 flex-col space-y-1 border-2 border-orange-200 hover:bg-orange-50 hover:text-black"
          onClick={onBackpacking}
        >
          <span className="text-lg sm:text-xl">🎒</span>
          <span className="text-xs sm:text-sm">Backpacking</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default TripTemplates;
