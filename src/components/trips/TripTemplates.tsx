import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";

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
  onBackpacking,
}: TripTemplatesProps) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          {t("trips.templates.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:gap-3">
        <Button
          variant="outline"
          className="h-12 sm:h-16 flex items-center justify-center space-x-2 border-2 border-blue-200 hover:bg-blue-50 hover:text-black"
          onClick={onBeachVacation}
        >
          <span className="text-lg sm:text-xl">🏖️</span>
          <span className="text-xs sm:text-sm">
            {t("trips.templates.beachVacation")}
          </span>
        </Button>
        <Button
          variant="outline"
          className="h-12 sm:h-16 flex items-center justify-center space-x-2 border-2 border-green-200 hover:bg-green-50 hover:text-black"
          onClick={onMountainTrip}
        >
          <span className="text-lg sm:text-xl">🏔️</span>
          <span className="text-xs sm:text-sm">
            {t("trips.templates.mountainTrip")}
          </span>
        </Button>
        <Button
          variant="outline"
          className="h-12 sm:h-16 flex items-center justify-center space-x-2 border-2 border-purple-200 hover:bg-purple-50 hover:text-black"
          onClick={onCityBreak}
        >
          <span className="text-lg sm:text-xl">🏛️</span>
          <span className="text-xs sm:text-sm">
            {t("trips.templates.cityBreak")}
          </span>
        </Button>
        <Button
          variant="outline"
          className="h-12 sm:h-16 flex items-center justify-center space-x-2 border-2 border-orange-200 hover:bg-orange-50 hover:text-black"
          onClick={onBackpacking}
        >
          <span className="text-lg sm:text-xl">🎒</span>
          <span className="text-xs sm:text-sm">
            {t("trips.templates.backpacking")}
          </span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default TripTemplates;
