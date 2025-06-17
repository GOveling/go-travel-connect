
import { useState } from "react";
import ExploreHeader from "./explore/ExploreHeader";
import ExploreSearchBar from "./explore/ExploreSearchBar";
import ExploreTabsContent from "./explore/ExploreTabsContent";

interface Place {
  name: string;
  location: string;
  rating: number;
  image: string;
  category: string;
  description: string;
  hours: string;
  website: string;
  phone: string;
  lat: number;
  lng: number;
}

interface ExploreSectionProps {
  onPlaceClick: (place: Place) => void;
}

const ExploreSection = ({ onPlaceClick }: ExploreSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Restaurants", "Hotels", "Attractions", "Shopping", "Nightlife"];

  const places: Place[] = [
    {
      name: "Eiffel Tower",
      location: "Paris, France",
      rating: 4.8,
      image: "🗼",
      category: "Attractions",
      description: "Iconic iron lattice tower and global cultural icon of France",
      hours: "9:00 AM - 12:45 AM",
      website: "www.toureiffel.paris",
      phone: "+33 8 92 70 12 39",
      lat: 48.8584,
      lng: 2.2945
    },
    {
      name: "Louvre Museum",
      location: "Paris, France", 
      rating: 4.7,
      image: "🏛️",
      category: "Attractions",
      description: "World's largest art museum and historic monument",
      hours: "9:00 AM - 6:00 PM",
      website: "www.louvre.fr",
      phone: "+33 1 40 20 50 50",
      lat: 48.8606,
      lng: 2.3376
    },
    {
      name: "Le Jules Verne",
      location: "Paris, France",
      rating: 4.6,
      image: "🍽️",
      category: "Restaurants", 
      description: "Michelin-starred restaurant in the Eiffel Tower",
      hours: "12:00 PM - 1:30 PM, 7:00 PM - 9:30 PM",
      website: "www.lejulesverne-paris.com",
      phone: "+33 1 45 55 61 44",
      lat: 48.8584,
      lng: 2.2945
    },
    {
      name: "Hotel Ritz Paris",
      location: "Paris, France",
      rating: 4.9,
      image: "🏨",
      category: "Hotels",
      description: "Legendary luxury hotel in Place Vendôme",
      hours: "24/7",
      website: "www.ritzparis.com", 
      phone: "+33 1 43 16 30 30",
      lat: 48.8685,
      lng: 2.3273
    },
    {
      name: "Champs-Élysées",
      location: "Paris, France",
      rating: 4.5,
      image: "🛍️",
      category: "Shopping",
      description: "Famous avenue for shopping and cafes",
      hours: "Varies by store",
      website: "www.champselysees-paris.com",
      phone: "N/A",
      lat: 48.8698,
      lng: 2.3076
    },
    {
      name: "Moulin Rouge",
      location: "Paris, France",
      rating: 4.4,
      image: "🎭",
      category: "Nightlife",
      description: "Famous cabaret and birthplace of the can-can",
      hours: "9:00 PM - 11:00 PM",
      website: "www.moulinrouge.fr",
      phone: "+33 1 53 09 82 82", 
      lat: 48.8842,
      lng: 2.3322
    }
  ];

  const filteredPlaces = selectedCategory === "All" 
    ? places 
    : places.filter(place => place.category === selectedCategory);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="space-y-6 pb-6">
      <ExploreHeader />
      <ExploreSearchBar />
      <ExploreTabsContent
        categories={categories}
        selectedCategory={selectedCategory}
        filteredPlaces={filteredPlaces}
        onCategoryClick={handleCategoryClick}
        onPlaceClick={onPlaceClick}
      />
    </div>
  );
};

export default ExploreSection;
