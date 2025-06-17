
import { Plane, Building, Car, Utensils, Smartphone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BookingCategoriesGridProps {
  onFlightClick: () => void;
  onHotelClick: () => void;
  onCarRentalClick: () => void;
  onToursClick: () => void;
  onESIMClick: () => void;
  onRestaurantClick: () => void;
}

const BookingCategoriesGrid = ({
  onFlightClick,
  onHotelClick,
  onCarRentalClick,
  onToursClick,
  onESIMClick,
  onRestaurantClick
}: BookingCategoriesGridProps) => {
  const bookingCategories = [
    {
      icon: Plane,
      title: "Flights",
      subtitle: "Find the best deals",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      action: onFlightClick
    },
    {
      icon: Building,
      title: "Hotels",
      subtitle: "Comfortable stays",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      action: onHotelClick
    },
    {
      icon: Car,
      title: "Transportation",
      subtitle: "Multiple travel options",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      action: onCarRentalClick
    },
    {
      icon: MapPin,
      title: "Tours",
      subtitle: "Guided experiences",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      action: onToursClick
    },
    {
      icon: Smartphone,
      title: "eSIMs",
      subtitle: "Stay connected",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      action: onESIMClick
    },
    {
      icon: Utensils,
      title: "Restaurants",
      subtitle: "Reserve tables",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      action: onRestaurantClick
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {bookingCategories.map((category, index) => {
        const Icon = category.icon;
        return (
          <Card 
            key={index} 
            className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${category.bgColor} cursor-pointer`}
            onClick={category.action}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                <Icon size={24} className="text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{category.title}</h3>
              <p className="text-xs text-gray-600">{category.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BookingCategoriesGrid;
