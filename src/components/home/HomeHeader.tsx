import { useLanguage } from "@/hooks/useLanguage";
import LocationWeatherWidget from "@/components/widgets/LocationWeatherWidget";

const HomeHeader = () => {
  const { t } = useLanguage();
  
  return (
    <div className="pb-4">
      {/* Weather Widget */}
      <div className="mb-4">
        <LocationWeatherWidget />
      </div>
      
      <div className="flex justify-center items-center mb-2 mx-0 px-0">
        {/* Logo centered */}
        <div className="flex justify-center px-0 mx-[5px]">
          <img
            alt="GOveling Logo"
            className="h-32 w-auto object-contain"
            src="/lovable-uploads/c492703b-bdd8-4cd6-9360-0748aea28be9.png"
          />
        </div>
      </div>
      <p className="mt-1 text-center">
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

export default HomeHeader;