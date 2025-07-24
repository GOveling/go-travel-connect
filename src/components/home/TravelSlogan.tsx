import { useI18n } from "@/hooks/useI18n";

const TravelSlogan = () => {
  const { tWithFallback } = useI18n();

  return (
    <div className="text-center py-2">
      <p>
        <span className="text-purple-600 font-semibold">
          {tWithFallback("home.travelSmart", "Viaja inteligente")}
        </span>
        <span className="text-gray-600">, </span>
        <span className="text-orange-500 font-semibold">
          {tWithFallback("home.travelMore", "viaja más")}
        </span>
      </p>
    </div>
  );
};

export default TravelSlogan;
