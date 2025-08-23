
import { useLanguage } from "@/hooks/useLanguage";

const TravelSlogan = () => {
  const { t } = useLanguage();

  return (
    <div className="text-center py-2">
      <p>
        <span className="text-purple-600 font-semibold">
          {t("home.travelSmart")}
        </span>
        <span className="text-gray-600">, </span>
        <span className="text-orange-500 font-semibold">
          {t("home.travelMore")}
        </span>
      </p>
    </div>
  );
};

export default TravelSlogan;
