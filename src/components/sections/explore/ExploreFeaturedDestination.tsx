import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ExploreFeaturedDestinationProps {
  onPlaceClick: (place: any) => void;
}

const ExploreFeaturedDestination = ({
  onPlaceClick,
}: ExploreFeaturedDestinationProps) => {
  const { t } = useLanguage();

  const nearbyPlace = {
    name: "Parque Central",
    location: "Ciudad de México",
    rating: 4.5,
    image: "🌳",
    category: "Parks",
    description: t("explore.nearbyPlaces.description"),
    hours: "6:00 AM - 10:00 PM",
    website: "www.parquecentral.mx",
    phone: "+52 55 1234-5678",
    lat: 19.4326,
    lng: -99.1332,
  };

  return (
    <Card
      className="overflow-hidden border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-purple-50"
      onClick={() => onPlaceClick(nearbyPlace)}
    >
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-6 text-white relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-white/20 p-2 rounded-full">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {t("explore.nearbyPlaces.title")}
              </h3>
              <p className="text-sm opacity-90">
                {t("explore.nearbyPlaces.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del lugar destacado */}
      <div className="p-6 space-y-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">{nearbyPlace.image}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-lg">
              {nearbyPlace.name}
            </h4>
            <div className="flex items-center space-x-1 mt-1">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                {nearbyPlace.location}
              </span>
            </div>

            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  {nearbyPlace.rating}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Clock size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {nearbyPlace.hours}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          {t("explore.nearbyPlaces.description")}
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            {nearbyPlace.category}
          </span>

          <Button
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
          >
            {t("explore.nearbyPlaces.exploreNow")}
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Indicador visual inferior */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500"></div>
    </Card>
  );
};

export default ExploreFeaturedDestination;
