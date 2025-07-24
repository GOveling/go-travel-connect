import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TravelStats } from "@/types/profile";
import { useLanguage } from "@/hooks/useLanguage";

interface TravelStatsCardProps {
  stats: TravelStats;
  loading: boolean;
}

const TravelStatsCard = ({ stats, loading }: TravelStatsCardProps) => {
  const { t } = useLanguage();

  const statItems = [
    {
      label: t("profile.countriesVisited"),
      value: stats.countries_visited.toString(),
    },
    {
      label: t("profile.citiesExplored"),
      value: stats.cities_explored.toString(),
    },
    {
      label: t("profile.placesVisited"),
      value: stats.places_visited.toString(),
    },
    {
      label: t("profile.achievementPoints"),
      value: stats.achievement_points.toString(),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-center">
          {t("profile.travelStats")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          {statItems.map((stat, index) => (
            <div key={index}>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-blue-600">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelStatsCard;
