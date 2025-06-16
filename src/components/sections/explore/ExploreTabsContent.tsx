
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TravelersSection from "../TravelersSection";
import ExploreCategoryTabs from "./ExploreCategoryTabs";
import ExploreFeaturedDestination from "./ExploreFeaturedDestination";
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
    <Tabs defaultValue="places" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="places" className="text-gray-700 data-[state=active]:text-black">Places</TabsTrigger>
        <TabsTrigger value="travelers" className="text-gray-700 data-[state=active]:text-black">Travelers</TabsTrigger>
      </TabsList>

      <TabsContent value="places" className="space-y-6">
        <ExploreCategoryTabs 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryClick={onCategoryClick}
        />

        {selectedCategory === "All" && (
          <ExploreFeaturedDestination onPlaceClick={onPlaceClick} />
        )}

        <ExplorePlacesGrid 
          places={filteredPlaces}
          selectedCategory={selectedCategory}
          onPlaceClick={onPlaceClick}
        />
      </TabsContent>

      <TabsContent value="travelers" className="space-y-6">
        <TravelersSection />
      </TabsContent>
    </Tabs>
  );
};

export default ExploreTabsContent;
