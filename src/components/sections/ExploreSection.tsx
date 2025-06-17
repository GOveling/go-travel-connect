
import { useState } from "react";
import ExploreHeader from "./explore/ExploreHeader";
import ExploreSearchBar from "./explore/ExploreSearchBar";
import ExploreTabsContent from "./explore/ExploreTabsContent";
import { places } from "./explore/exploreData";

const ExploreSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handlePlaceClick = (place: any) => {
    console.log("Place clicked:", place);
  };

  // Filter places based on search term and category
  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         place.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || place.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(places.map(place => place.category)))];

  return (
    <div className="min-h-screen bg-gray-50">
      <ExploreHeader />
      
      <div className="px-4 pb-4 space-y-4">
        <ExploreSearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <ExploreTabsContent
          categories={categories}
          selectedCategory={selectedCategory}
          filteredPlaces={filteredPlaces}
          onCategoryClick={setSelectedCategory}
          onPlaceClick={handlePlaceClick}
        />
      </div>
    </div>
  );
};

export default ExploreSection;
