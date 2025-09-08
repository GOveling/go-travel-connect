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

  return null;
};

export default TripTemplates;
