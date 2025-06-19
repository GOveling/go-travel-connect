
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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

interface ExplorePlacesGridProps {
  places: Place[];
  selectedCategory: string;
  onPlaceClick: (place: Place) => void;
}

const ExplorePlacesGrid = ({ places, selectedCategory, onPlaceClick }: ExplorePlacesGridProps) => {
  const [showAll, setShowAll] = useState(false);
  
  // Show only first 4 places unless "Show All" is clicked
  const displayedPlaces = showAll ? places : places.slice(0, 4);
  const hasMorePlaces = places.length > 4;

  return (
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
        {displayedPlaces.map((place, index) => (
          <Card 
            key={index} 
            className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => onPlaceClick(place)}
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
      
      {hasMorePlaces && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
            className="text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            {showAll ? "Mostrar Menos" : "Mostrar Más"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExplorePlacesGrid;
