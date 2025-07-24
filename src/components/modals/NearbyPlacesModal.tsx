import { useState } from "react";
import { MapPin, Star, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface NearbyPlace {
  id: string;
  name: string;
  location: string;
  rating: number;
  image: string;
  category: string;
  description: string;
  distance: string;
}

interface NearbyPlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceClick: (place: any) => void;
}

const NearbyPlacesModal = ({
  isOpen,
  onClose,
  onPlaceClick,
}: NearbyPlacesModalProps) => {
  const { t } = useLanguage();

  const nearbyPlaces: NearbyPlace[] = [
    {
      id: "nearby-1",
      name: "Parque Central",
      location: "Ciudad de México",
      rating: 4.5,
      image: "🌳",
      category: "Parks",
      description: t("explore.nearbyPlaces.samplePlaces.park"),
      distance: "0.5 km",
    },
    {
      id: "nearby-2",
      name: "Museo de Arte",
      location: "Centro Histórico",
      rating: 4.7,
      image: "🎨",
      category: "Museum",
      description: t("explore.nearbyPlaces.samplePlaces.museum"),
      distance: "0.8 km",
    },
    {
      id: "nearby-3",
      name: "Café Luna",
      location: "Zona Rosa",
      rating: 4.3,
      image: "☕",
      category: "Cafe",
      description: t("explore.nearbyPlaces.samplePlaces.cafe"),
      distance: "0.3 km",
    },
    {
      id: "nearby-4",
      name: "Plaza de la Cultura",
      location: "Centro",
      rating: 4.6,
      image: "🏛️",
      category: "Tourist Attraction",
      description: t("explore.nearbyPlaces.samplePlaces.plaza"),
      distance: "1.2 km",
    },
    {
      id: "nearby-5",
      name: "Mercado Local",
      location: "Barrio Tradicional",
      rating: 4.4,
      image: "🏪",
      category: "Market",
      description: t("explore.nearbyPlaces.samplePlaces.market"),
      distance: "0.7 km",
    },
  ];

  const handlePlaceClick = (place: NearbyPlace) => {
    const placeWithDetails = {
      ...place,
      hours:
        place.category === "Parks"
          ? "6:00 AM - 10:00 PM"
          : place.category === "Museum"
            ? "9:00 AM - 6:00 PM"
            : place.category === "Cafe"
              ? "7:00 AM - 9:00 PM"
              : "9:00 AM - 8:00 PM",
      website: `www.${place.name.toLowerCase().replace(/\s+/g, "")}.com`,
      phone: "+52 55 1234-5678",
      lat: 19.4326,
      lng: -99.1332,
    };

    onPlaceClick(placeWithDetails);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center">
            <MapPin className="mr-2 text-purple-600" size={24} />
            {t("explore.nearbyPlaces.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t("explore.nearbyPlaces.description")}
          </p>

          <div className="space-y-3">
            {nearbyPlaces.map((place) => (
              <Card
                key={place.id}
                className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePlaceClick(place)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{place.image}</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {place.name}
                          </h3>
                          <div className="flex items-center space-x-1 mt-1">
                            <MapPin size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {place.location}
                            </span>
                            <span className="text-xs text-purple-600 font-medium">
                              • {place.distance}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-2">
                          <Star
                            size={12}
                            className="text-yellow-500 fill-yellow-500"
                          />
                          <span className="text-xs font-medium">
                            {place.rating}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {place.description}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {place.category}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-purple-600 h-6 px-2"
                        >
                          {t("explore.nearbyPlaces.viewDetails")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Button variant="outline" onClick={onClose} className="w-full">
              {t("common.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NearbyPlacesModal;
