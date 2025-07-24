import CommunityStats from "../travelers/CommunityStats";
import TravelersList from "../travelers/TravelersList";
import LoadMoreButton from "../travelers/LoadMoreButton";
import { useLanguage } from "@/contexts/LanguageContext";

const TravelersSection = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {t("travelers.title")}
        </h3>
        <p className="text-gray-600">{t("travelers.subtitle")}</p>
      </div>

      {/* Community Stats */}
      <CommunityStats />

      {/* Travelers List */}
      <TravelersList />

      {/* Load More */}
      <LoadMoreButton />
    </div>
  );
};

export default TravelersSection;
