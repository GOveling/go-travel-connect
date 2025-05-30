import { Search, Star, MapPin, Filter, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import PlaceDetailModal from "@/components/modals/PlaceDetailModal";
import AddToTripModal from "@/components/modals/AddToTripModal";
import TravelersSection from "./TravelersSection";
import NotificationAlertsModal from "@/components/modals/NotificationAlertsModal";
import { useHomeState } from "@/hooks/useHomeState";

const ExploreSection = () => {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  
  // Notification count state
  const [notificationCount, setNotificationCount] = useState(5);

  // Get actual trips from shared state
  const { trips } = useHomeState();

  const popularPlaces = [
    {
      name: "Eiffel Tower",
      location: "Paris, France",
      rating: 4.8,
      image: "🗼",
      category: "Landmark",
      description: "An iconic iron lattice tower on the Champ de Mars in Paris, France. Built in 1889, it's one of the most recognizable structures in the world.",
      hours: "9:30 AM - 11:45 PM",
      website: "www.toureiffel.paris",
      phone: "+33 8 92 70 12 39"
    },
    {
      name: "Colosseum",
      location: "Rome, Italy",
      rating: 4.7,
      image: "🏛️",
      category: "Historical",
      description: "An ancient amphitheatre in the centre of Rome, Italy. Built of travertine limestone, tuff, and brick-faced concrete.",
      hours: "8:30 AM - 7:00 PM",
      website: "www.colosseum.com",
      phone: "+39 06 3996 7700"
    },
    {
      name: "Santorini",
      location: "Greece",
      rating: 4.9,
      image: "🌅",
      category: "Beach",
      description: "A Greek island in the southern Aegean Sea, known for its dramatic views, stunning sunsets, and distinctive white buildings.",
      hours: "24/7 (Island)",
      website: "www.santorini.com",
      phone: "+30 22860 22000"
    },
    {
      name: "Tokyo Tower",
      location: "Tokyo, Japan",
      rating: 4.6,
      image: "🗼",
      category: "Landmark",
      description: "A communications and observation tower in Tokyo, Japan. Inspired by the Eiffel Tower, it offers panoramic views of the city.",
      hours: "9:00 AM - 11:00 PM",
      website: "www.tokyotower.co.jp",
      phone: "+81 3-3433-5111"
    }
  ];

  const categories = ["All", "Landmarks", "Museums", "Beaches", "Historical", "Nature"];

  const handlePlaceClick = (place: any) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  const handleAddToTrip = () => {
    setIsModalOpen(false);
    setIsAddToTripModalOpen(true);
  };

  const handleAddToExistingTrip = (tripId: number) => {
    const selectedTrip = trips.find(trip => trip.id === tripId);
    console.log(`Adding ${selectedPlace?.name} to trip:`, selectedTrip?.name);
    // TODO: Implement actual saving logic to trip's saved places
  };

  const handleCreateNewTrip = () => {
    console.log(`Creating new trip with ${selectedPlace?.name}`);
    // TODO: Implement new trip creation with selected place
  };

  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotificationCount(0);
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header with Notification Bell */}
      <div className="pt-8 pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Explore</h2>
          <p className="text-gray-600">Discover amazing places and connect with fellow travelers</p>
        </div>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNotificationClick}
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <Bell size={24} className="text-gray-600" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <Input
          placeholder="Search destinations, attractions..."
          className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500"
        />
        <Button size="sm" className="absolute right-2 top-2 bg-gradient-to-r from-purple-600 to-orange-500">
          <Filter size={16} />
        </Button>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="places" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="places" className="text-gray-700 data-[state=active]:text-black">Places</TabsTrigger>
          <TabsTrigger value="travelers" className="text-gray-700 data-[state=active]:text-black">Travelers</TabsTrigger>
        </TabsList>

        <TabsContent value="places" className="space-y-6">
          {/* Categories */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className={`whitespace-nowrap ${
                  index === 0
                    ? "bg-gradient-to-r from-purple-600 to-orange-500"
                    : "border-gray-300"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Featured Destination */}
          <Card className="overflow-hidden border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => handlePlaceClick({
                  name: "Maldives",
                  location: "Indian Ocean",
                  rating: 4.9,
                  image: "🏝️",
                  category: "Beach",
                  description: "A tropical paradise consisting of 1,192 coral islands grouped in 26 atolls. Known for crystal clear waters, pristine beaches, and luxury overwater bungalows.",
                  hours: "24/7 (Island Nation)",
                  website: "www.visitmaldives.com",
                  phone: "+960 330-3224"
                })}>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-3xl">🏝️</span>
                <div>
                  <h3 className="text-xl font-bold">Maldives</h3>
                  <p className="text-sm opacity-90">Featured Destination</p>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-3">
                Paradise islands with crystal clear waters and overwater bungalows
              </p>
              <Button variant="secondary" size="sm">
                Explore Now
              </Button>
            </div>
          </Card>

          {/* Trending Places */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Trending Places</h3>
              <Button variant="ghost" size="sm" className="text-purple-600">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {popularPlaces.map((place, index) => (
                <Card 
                  key={index} 
                  className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => handlePlaceClick(place)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
                      <span className="text-4xl">{place.image}</span>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm mb-1">{place.name}</h4>
                      <div className="flex items-center space-x-1 mb-2">
                        <MapPin size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-500">{place.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium">{place.rating}</span>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {place.category}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="travelers" className="space-y-6">
          <TravelersSection />
        </TabsContent>
      </Tabs>

      <PlaceDetailModal 
        place={selectedPlace}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToTrip={handleAddToTrip}
      />

      <AddToTripModal
        isOpen={isAddToTripModalOpen}
        onClose={() => setIsAddToTripModalOpen(false)}
        existingTrips={trips.filter(trip => trip.status !== 'completed')}
        onAddToExistingTrip={handleAddToExistingTrip}
        onCreateNewTrip={handleCreateNewTrip}
        postLocation={selectedPlace?.name}
      />

      <NotificationAlertsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notificationCount={notificationCount}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />
    </div>
  );
};

export default ExploreSection;
