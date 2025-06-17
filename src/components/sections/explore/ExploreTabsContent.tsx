
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExploreCategoryTabs from "./ExploreCategoryTabs";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExploreTabsContentProps {
  categories: string[];
  selectedCategory: string;
  filteredPlaces: any[];
  onCategoryClick: (category: string) => void;
  onPlaceClick: (place: any) => void;
}

const ExploreTabsContent = ({
  categories,
  selectedCategory,
  filteredPlaces,
  onCategoryClick,
  onPlaceClick
}: ExploreTabsContentProps) => {
  const { t } = useLanguage();
  
  return (
    <Tabs defaultValue="places" className="w-full">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="places" className="flex-1">Places</TabsTrigger>
        <TabsTrigger value="experiences" className="flex-1">Experiences</TabsTrigger>
      </TabsList>
      
      <TabsContent value="places" className="space-y-4">
        <ExploreCategoryTabs 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryClick={onCategoryClick}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPlaces.map((place) => (
            <Card key={place.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={place.image} 
                  alt={place.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{place.rating}</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{place.name}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={14} className="mr-1" />
                  <span className="text-sm">{place.location}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{place.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-purple-600">{place.price}</span>
                  <div className="space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlaceClick(place);
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlaceClick(place);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-orange-500"
                    >
                      {t("explore.addToTrip")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="experiences" className="space-y-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Experiences content coming soon!</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ExploreTabsContent;
