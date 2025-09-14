import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TravelStats } from "@/types/profile";
import { useLanguage } from "@/hooks/useLanguage";
import TravelStatsDetailModal from "@/components/modals/TravelStatsDetailModal";

interface TravelStatsCardProps {
  stats: TravelStats;
  loading: boolean;
}

const TravelStatsCard = ({ stats, loading }: TravelStatsCardProps) => {
  const { t } = useLanguage();
  const [modalType, setModalType] = useState<"places" | "countries" | "cities" | "achievements" | null>(null);

  const statItems = [
    {
      label: t("profile.countriesVisited"),
      value: stats.countries_visited.toString(),
      type: "countries" as const,
      clickable: stats.countries_visited > 0,
    },
    {
      label: t("profile.citiesExplored"),
      value: stats.cities_explored.toString(),
      type: "cities" as const,
      clickable: stats.cities_explored > 0,
    },
    {
      label: t("profile.placesVisited"),
      value: stats.places_visited.toString(),
      type: "places" as const,
      clickable: stats.places_visited > 0,
    },
    {
      label: t("profile.achievementPoints"),
      value: stats.achievement_points.toString(),
      type: "achievements" as const,
      clickable: stats.achievement_points > 0,
    },
  ];

  const handleStatClick = (type: "places" | "countries" | "cities" | "achievements") => {
    setModalType(type);
  };

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
            <div 
              key={index}
              className={`${stat.clickable && !loading ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors' : ''}`}
              onClick={() => stat.clickable && !loading ? handleStatClick(stat.type) : undefined}
            >
              {loading ? (
                <>
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </>
              ) : (
                <>
                  <p className={`text-2xl font-bold ${stat.clickable ? 'text-blue-600 hover:text-blue-700' : 'text-blue-600'}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  {stat.clickable && (
                    <p className="text-xs text-blue-500 mt-1">{t("profile.viewDetails")}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <TravelStatsDetailModal
          isOpen={modalType !== null}
          onClose={() => setModalType(null)}
          type={modalType || "places"}
          title={
            modalType === "places" ? t("profile.statsModal.placesVisited") :
            modalType === "countries" ? t("profile.statsModal.countriesVisited") :
            modalType === "cities" ? t("profile.statsModal.citiesExplored") :
            t("profile.statsModal.achievementsEarned")
          }
        />
      </CardContent>
    </Card>
  );
};

export default TravelStatsCard;
