
import { Plane, Building, Car, MapPin, Coffee, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookingCategoriesGridProps {
  onFlightClick: () => void;
  onHotelClick: () => void;
  onCarRentalClick: () => void;
  onToursClick: () => void;
  onRestaurantClick: () => void;
  onESIMClick: () => void;
}

const BookingCategoriesGrid = ({
  onFlightClick,
  onHotelClick,
  onCarRentalClick,
  onToursClick,
  onRestaurantClick,
  onESIMClick
}: BookingCategoriesGridProps) => {
  const { t } = useLanguage();
  
  const categories = [
    { icon: Plane, label: t("booking.categories.flights"), onClick: onFlightClick, color: "bg-blue-500" },
    { icon: Building, label: t("booking.categories.hotels"), onClick: onHotelClick, color: "bg-green-500" },
    { icon: Car, label: t("booking.categories.carRental"), onClick: onCarRentalClick, color: "bg-purple-500" },
    { icon: MapPin, label: t("booking.categories.tours"), onClick: onToursClick, color: "bg-orange-500" },
    { icon: Coffee, label: t("booking.categories.restaurants"), onClick: onRestaurantClick, color: "bg-pink-500" },
    { icon: Wifi, label: t("booking.categories.esim"), onClick: onESIMClick, color: "bg-indigo-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((category, index) => {
        const Icon = category.icon;
        return (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={category.onClick}
          >
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Icon size={24} className="text-white" />
              </div>
              <p className="font-medium text-gray-700">{category.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BookingCategoriesGrid;
