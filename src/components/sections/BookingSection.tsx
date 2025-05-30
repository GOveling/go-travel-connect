
import { useState } from "react";
import { Plane, Building, Car, Utensils, Smartphone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FlightBookingModal from "@/components/modals/FlightBookingModal";
import HotelBookingModal from "@/components/modals/HotelBookingModal";
import CarRentalModal from "@/components/modals/CarRentalModal";
import ToursModal from "@/components/modals/ToursModal";
import RestaurantModal from "@/components/modals/RestaurantModal";
import ESIMModal from "@/components/modals/ESIMModal";

const BookingSection = () => {
  const [isFlightModalOpen, setIsFlightModalOpen] = useState(false);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isCarRentalModalOpen, setIsCarRentalModalOpen] = useState(false);
  const [isToursModalOpen, setIsToursModalOpen] = useState(false);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [isESIMModalOpen, setIsESIMModalOpen] = useState(false);

  const bookingCategories = [
    {
      icon: Plane,
      title: "Flights",
      subtitle: "Find the best deals",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      action: () => setIsFlightModalOpen(true)
    },
    {
      icon: Building,
      title: "Hotels",
      subtitle: "Comfortable stays",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      action: () => setIsHotelModalOpen(true)
    },
    {
      icon: Car,
      title: "Car Rental",
      subtitle: "Explore at your pace",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      action: () => setIsCarRentalModalOpen(true)
    },
    {
      icon: MapPin,
      title: "Tours",
      subtitle: "Guided experiences",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      action: () => setIsToursModalOpen(true)
    },
    {
      icon: Smartphone,
      title: "eSIMs",
      subtitle: "Stay connected",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      action: () => setIsESIMModalOpen(true)
    },
    {
      icon: Utensils,
      title: "Restaurants",
      subtitle: "Reserve tables",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      action: () => setIsRestaurantModalOpen(true)
    }
  ];

  const recentBookings = [
    {
      type: "Flight",
      details: "NYC → Paris",
      date: "Dec 15, 2024",
      status: "Confirmed",
      amount: "$542"
    },
    {
      type: "Hotel",
      details: "Hotel Le Marais",
      date: "Dec 15-20, 2024",
      status: "Confirmed",
      amount: "$890"
    }
  ];

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="pt-8 pb-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Booking</h2>
        <p className="text-gray-600">Book everything for your perfect trip</p>
      </div>

      {/* Special Offer */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-6 text-white">
          <h3 className="text-xl font-bold mb-2">✨ Special Offer!</h3>
          <p className="text-sm opacity-90 mb-3">
            Get 20% off on your first hotel booking with code WELCOME20
          </p>
          <Button variant="secondary" size="sm">
            Claim Offer
          </Button>
        </div>
      </Card>

      {/* Booking Categories */}
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

      {/* Quick Book */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Book</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-left justify-start"
            onClick={() => setIsFlightModalOpen(true)}
          >
            <Plane className="mr-3" size={20} />
            <div>
              <p className="font-medium">Round-trip Flight</p>
              <p className="text-xs opacity-90">From $299</p>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="w-full h-14 text-left justify-start border-2"
            onClick={() => setIsHotelModalOpen(true)}
          >
            <Building className="mr-3" size={20} />
            <div>
              <p className="font-medium">Hotel + Flight Package</p>
              <p className="text-xs text-gray-600">Save up to 40%</p>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentBookings.map((booking, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {booking.type}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {booking.status}
                  </span>
                </div>
                <p className="font-medium text-sm">{booking.details}</p>
                <p className="text-xs text-gray-600">{booking.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">{booking.amount}</p>
                <Button size="sm" variant="ghost" className="text-xs mt-1">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* All Modals */}
      <FlightBookingModal
        isOpen={isFlightModalOpen}
        onClose={() => setIsFlightModalOpen(false)}
      />
      
      <HotelBookingModal
        isOpen={isHotelModalOpen}
        onClose={() => setIsHotelModalOpen(false)}
      />
      
      <CarRentalModal
        isOpen={isCarRentalModalOpen}
        onClose={() => setIsCarRentalModalOpen(false)}
      />
      
      <ToursModal
        isOpen={isToursModalOpen}
        onClose={() => setIsToursModalOpen(false)}
      />
      
      <RestaurantModal
        isOpen={isRestaurantModalOpen}
        onClose={() => setIsRestaurantModalOpen(false)}
      />

      <ESIMModal
        isOpen={isESIMModalOpen}
        onClose={() => setIsESIMModalOpen(false)}
      />
    </div>
  );
};

export default BookingSection;
