import { Search, Star, MapPin, Filter, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import PlaceDetailModal from "@/components/modals/PlaceDetailModal";
import ExploreAddToTripModal from "@/components/modals/ExploreAddToTripModal";
import TravelersSection from "./TravelersSection";
import NotificationAlertsModal from "@/components/modals/NotificationAlertsModal";
import { useHomeState } from "@/hooks/useHomeState";
import { useToast } from "@/hooks/use-toast";

const ExploreSection = () => {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Notification count state
  const [notificationCount, setNotificationCount] = useState(5);

  // Get actual trips from shared state
  const { trips, addPlaceToTrip, setTrips } = useHomeState();
  const { toast } = useToast();

  const allPlaces = [
    // Landmarks
    {
      name: "Eiffel Tower",
      location: "Paris, France",
      rating: 4.8,
      image: "🗼",
      category: "Landmarks",
      description: "An iconic iron lattice tower on the Champ de Mars in Paris, France. Built in 1889, it's one of the most recognizable structures in the world.",
      hours: "9:30 AM - 11:45 PM",
      website: "www.toureiffel.paris",
      phone: "+33 8 92 70 12 39",
      lat: 48.8566,
      lng: 2.3522
    },
    {
      name: "Tokyo Tower",
      location: "Tokyo, Japan",
      rating: 4.6,
      image: "🗼",
      category: "Landmarks",
      description: "A communications and observation tower in Tokyo, Japan. Inspired by the Eiffel Tower, it offers panoramic views of the city.",
      hours: "9:00 AM - 11:00 PM",
      website: "www.tokyotower.co.jp",
      phone: "+81 3-3433-5111",
      lat: 35.6586,
      lng: 139.7454
    },
    {
      name: "Statue of Liberty",
      location: "New York, USA",
      rating: 4.7,
      image: "🗽",
      category: "Landmarks",
      description: "A symbol of freedom and democracy, gifted by France to the United States.",
      hours: "9:00 AM - 5:00 PM",
      website: "www.nps.gov/stli",
      phone: "+1 212-363-3200",
      lat: 40.6892,
      lng: -74.0445
    },
    {
      name: "Big Ben",
      location: "London, UK",
      rating: 4.5,
      image: "🕰️",
      category: "Landmarks",
      description: "The iconic clock tower at the north end of the Palace of Westminster.",
      hours: "Tours available",
      website: "www.parliament.uk",
      phone: "+44 20 7219 4272",
      lat: 51.4994,
      lng: -0.1245
    },
    // Museums
    {
      name: "Louvre Museum",
      location: "Paris, France",
      rating: 4.7,
      image: "🎨",
      category: "Museums",
      description: "The world's largest art museum and home to the Mona Lisa.",
      hours: "9:00 AM - 6:00 PM",
      website: "www.louvre.fr",
      phone: "+33 1 40 20 50 50",
      lat: 48.8606,
      lng: 2.3376
    },
    {
      name: "British Museum",
      location: "London, UK",
      rating: 4.6,
      image: "🏛️",
      category: "Museums",
      description: "A museum dedicated to human history, art and culture.",
      hours: "10:00 AM - 5:00 PM",
      website: "www.britishmuseum.org",
      phone: "+44 20 7323 8299",
      lat: 51.5194,
      lng: -0.1270
    },
    {
      name: "Metropolitan Museum",
      location: "New York, USA",
      rating: 4.8,
      image: "🖼️",
      category: "Museums",
      description: "One of the world's largest and most comprehensive art museums.",
      hours: "10:00 AM - 5:00 PM",
      website: "www.metmuseum.org",
      phone: "+1 212-535-7710",
      lat: 40.7794,
      lng: -73.9632
    },
    // Beaches
    {
      name: "Santorini",
      location: "Greece",
      rating: 4.9,
      image: "🌅",
      category: "Beaches",
      description: "A Greek island in the southern Aegean Sea, known for its dramatic views, stunning sunsets, and distinctive white buildings.",
      hours: "24/7 (Island)",
      website: "www.santorini.com",
      phone: "+30 22860 22000",
      lat: 39.3999,
      lng: 25.4615
    },
    {
      name: "Bora Bora",
      location: "French Polynesia",
      rating: 4.9,
      image: "🏝️",
      category: "Beaches",
      description: "A tropical paradise with crystal clear lagoons and overwater bungalows.",
      hours: "24/7 (Island)",
      website: "www.borabora.com",
      phone: "+689 40 67 76 36",
      lat: -16.5004,
      lng: -151.7415
    },
    {
      name: "Copacabana Beach",
      location: "Rio de Janeiro, Brazil",
      rating: 4.4,
      image: "🏖️",
      category: "Beaches",
      description: "Famous beach known for its vibrant culture and beautiful coastline.",
      hours: "24/7",
      website: "www.rio.rj.gov.br",
      phone: "+55 21 2976-1700",
      lat: -22.9711,
      lng: -43.1822
    },
    // Historical
    {
      name: "Colosseum",
      location: "Rome, Italy",
      rating: 4.7,
      image: "🏛️",
      category: "Historical",
      description: "An ancient amphitheatre in the centre of Rome, Italy. Built of travertine limestone, tuff, and brick-faced concrete.",
      hours: "8:30 AM - 7:00 PM",
      website: "www.colosseum.com",
      phone: "+39 06 3996 7700",
      lat: 41.9028,
      lng: 12.4964
    },
    {
      name: "Machu Picchu",
      location: "Peru",
      rating: 4.8,
      image: "🏔️",
      category: "Historical",
      description: "Ancient Incan citadel set high in the Andes Mountains.",
      hours: "6:00 AM - 5:30 PM",
      website: "www.machupicchu.gob.pe",
      phone: "+51 84 582030",
      lat: -13.1631,
      lng: -72.5450
    },
    {
      name: "Great Wall of China",
      location: "China",
      rating: 4.6,
      image: "🏯",
      category: "Historical",
      description: "Ancient fortification system built to protect Chinese states.",
      hours: "7:00 AM - 6:00 PM",
      website: "www.greatwall.com.cn",
      phone: "+86 10 6912 1383",
      lat: 40.4319,
      lng: 116.5704
    },
    // Nature
    {
      name: "Grand Canyon",
      location: "Arizona, USA",
      rating: 4.8,
      image: "🏔️",
      category: "Nature",
      description: "A steep-sided canyon carved by the Colorado River.",
      hours: "24/7",
      website: "www.nps.gov/grca",
      phone: "+1 928-638-7888",
      lat: 36.1069,
      lng: -112.1129
    },
    {
      name: "Amazon Rainforest",
      location: "Brazil",
      rating: 4.7,
      image: "🌳",
      category: "Nature",
      description: "The world's largest tropical rainforest.",
      hours: "Guided tours available",
      website: "www.amazonconservation.org",
      phone: "+55 92 3633-4299",
      lat: -3.4653,
      lng: -62.2159
    },
    {
      name: "Norwegian Fjords",
      location: "Norway",
      rating: 4.9,
      image: "🏔️",
      category: "Nature",
      description: "Dramatic landscapes with steep cliffs and pristine waters.",
      hours: "24/7",
      website: "www.visitnorway.com",
      phone: "+47 22 00 25 00",
      lat: 62.4722,
      lng: 7.1475
    },
    // Restaurants
    {
      name: "Le Bernardin",
      location: "New York, USA",
      rating: 4.9,
      image: "🍽️",
      category: "Restaurants",
      description: "Three Michelin-starred French seafood restaurant.",
      hours: "5:30 PM - 10:00 PM",
      website: "www.le-bernardin.com",
      phone: "+1 212-554-1515",
      lat: 40.7614,
      lng: -73.9776
    },
    {
      name: "Osteria Francescana",
      location: "Modena, Italy",
      rating: 4.8,
      image: "🍝",
      category: "Restaurants",
      description: "Three Michelin-starred restaurant serving innovative Italian cuisine.",
      hours: "12:30 PM - 2:00 PM, 7:30 PM - 10:00 PM",
      website: "www.osteriafrancescana.it",
      phone: "+39 059 223912",
      lat: 44.6471,
      lng: 10.9252
    },
    {
      name: "Sukiyabashi Jiro",
      location: "Tokyo, Japan",
      rating: 4.7,
      image: "🍣",
      category: "Restaurants",
      description: "World-famous sushi restaurant with three Michelin stars.",
      hours: "11:30 AM - 2:00 PM, 5:00 PM - 8:00 PM",
      website: "www.sushi-jiro.jp",
      phone: "+81 3-3535-3600",
      lat: 35.6762,
      lng: 139.7633
    },
    // Next Concerts
    {
      name: "Madison Square Garden",
      location: "New York, USA",
      rating: 4.6,
      image: "🎤",
      category: "Next Concerts",
      description: "Iconic venue hosting major concerts and events.",
      hours: "Event dependent",
      website: "www.msg.com",
      phone: "+1 212-465-6741",
      lat: 40.7505,
      lng: -73.9934
    },
    {
      name: "Royal Albert Hall",
      location: "London, UK",
      rating: 4.7,
      image: "🎼",
      category: "Next Concerts",
      description: "Historic concert hall hosting classical and contemporary performances.",
      hours: "Box office: 9:00 AM - 9:00 PM",
      website: "www.royalalberthall.com",
      phone: "+44 20 7589 8212",
      lat: 51.5009,
      lng: -0.1773
    },
    {
      name: "Sydney Opera House",
      location: "Sydney, Australia",
      rating: 4.8,
      image: "🎭",
      category: "Next Concerts",
      description: "World-renowned performing arts venue with distinctive architecture.",
      hours: "Tours: 9:00 AM - 5:00 PM",
      website: "www.sydneyoperahouse.com",
      phone: "+61 2 9250 7111",
      lat: -33.8568,
      lng: 151.2153
    },
    // Night Life
    {
      name: "Berghain",
      location: "Berlin, Germany",
      rating: 4.5,
      image: "🌃",
      category: "Night Life",
      description: "World-famous techno club in a former power plant.",
      hours: "Friday midnight - Monday morning",
      website: "www.berghain.de",
      phone: "+49 30 29004879",
      lat: 52.5107,
      lng: 13.4426
    },
    {
      name: "Rooftop Bar at Marina Bay",
      location: "Singapore",
      rating: 4.6,
      image: "🍸",
      category: "Night Life",
      description: "Stunning rooftop bar with panoramic city views.",
      hours: "6:00 PM - 2:00 AM",
      website: "www.marinabaysands.com",
      phone: "+65 6688 8888",
      lat: 1.2834,
      lng: 103.8607
    },
    {
      name: "Pacha Ibiza",
      location: "Ibiza, Spain",
      rating: 4.4,
      image: "🕺",
      category: "Night Life",
      description: "Legendary nightclub on the party island of Ibiza.",
      hours: "11:00 PM - 6:00 AM",
      website: "www.pacha.com",
      phone: "+34 971 313 612",
      lat: 38.9067,
      lng: 1.4237
    },
    // Fun for Kids
    {
      name: "Disneyland Paris",
      location: "Paris, France",
      rating: 4.7,
      image: "🎠",
      category: "Fun for Kids",
      description: "Magical theme park with Disney characters and attractions.",
      hours: "10:00 AM - 10:00 PM",
      website: "www.disneylandparis.com",
      phone: "+33 825 30 05 00",
      lat: 48.8674,
      lng: 2.7834
    },
    {
      name: "Universal Studios",
      location: "Orlando, USA",
      rating: 4.6,
      image: "🎢",
      category: "Fun for Kids",
      description: "Thrilling theme park with movie-themed rides and shows.",
      hours: "9:00 AM - 10:00 PM",
      website: "www.universalorlando.com",
      phone: "+1 407-363-8000",
      lat: 28.4743,
      lng: -81.4677
    },
    {
      name: "LEGOLAND",
      location: "Billund, Denmark",
      rating: 4.5,
      image: "🧱",
      category: "Fun for Kids",
      description: "Theme park built from LEGO bricks with family-friendly rides.",
      hours: "10:00 AM - 6:00 PM",
      website: "www.legoland.dk",
      phone: "+45 75 33 13 33",
      lat: 55.7364,
      lng: 9.1262
    }
  ];

  const categories = ["All", "Landmarks", "Museums", "Beaches", "Historical", "Nature", "Restaurants", "Next Concerts", "Night Life", "Fun for Kids"];

  // Filter places based on selected category
  const filteredPlaces = selectedCategory === "All" 
    ? allPlaces.slice(0, 4) // Show first 4 for "All" category
    : allPlaces.filter(place => place.category === selectedCategory);

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

  const handleAddToExistingTrip = (tripId: number, place: any) => {
    addPlaceToTrip(tripId, place);
    const selectedTrip = trips.find(trip => trip.id === tripId);
    
    toast({
      title: "Place added to trip!",
      description: `${place.name} has been saved to ${selectedTrip?.name}`,
    });
    
    setIsAddToTripModalOpen(false);
    setSelectedPlace(null);
  };

  const handleCreateNewTrip = (tripData: any) => {
    setTrips(prev => [...prev, tripData]);
    setIsAddToTripModalOpen(false);
    setSelectedPlace(null);
  };

  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotificationCount(0);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
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
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryClick(category)}
                className={`whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-purple-600 to-orange-500"
                    : "border-gray-300"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Featured Destination - only show when "All" is selected */}
          {selectedCategory === "All" && (
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
                    phone: "+960 330-3224",
                    lat: 3.2028,
                    lng: 73.2207
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
          )}

          {/* Places Grid */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedCategory === "All" ? "Trending Places" : `${selectedCategory} Places`}
              </h3>
              <Button variant="ghost" size="sm" className="text-purple-600">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredPlaces.map((place, index) => (
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

      <ExploreAddToTripModal
        isOpen={isAddToTripModalOpen}
        onClose={() => setIsAddToTripModalOpen(false)}
        selectedPlace={selectedPlace}
        existingTrips={trips.filter(trip => trip.status !== 'completed')}
        onAddToExistingTrip={handleAddToExistingTrip}
        onCreateNewTrip={handleCreateNewTrip}
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
