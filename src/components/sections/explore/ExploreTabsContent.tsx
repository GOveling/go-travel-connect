
import ExploreCategoryTabs from "./ExploreCategoryTabs";
import ExploreFeaturedDestination from "./ExploreFeaturedDestination";
import ExplorePopularPlace from "./ExplorePopularPlace";
import ExplorePlacesGrid from "./ExplorePlacesGrid";

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

interface ExploreTabsContentProps {
  categories: string[];
  selectedCategory: string;
  filteredPlaces: Place[];
  onCategoryClick: (category: string) => void;
  onPlaceClick: (place: Place) => void;
}

const ExploreTabsContent = ({ 
  categories, 
  selectedCategory, 
  filteredPlaces, 
  onCategoryClick, 
  onPlaceClick 
}: ExploreTabsContentProps) => {
  return (
    <div className="w-full space-y-6">
      <ExploreCategoryTabs 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryClick={onCategoryClick}
      />

      {selectedCategory === "All" && (
        <>
          <ExploreFeaturedDestination onPlaceClick={onPlaceClick} />
          <ExplorePopularPlace onPlaceClick={onPlaceClick} />
        </>
      )}

      <ExplorePlacesGrid 
        places={filteredPlaces}
        selectedCategory={selectedCategory}
        onPlaceClick={onPlaceClick}
      />
    </div>
  );
};

export default ExploreTabsContent;
