
import { MapPin, Star, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  if (places.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No places found</h3>
        <p className="text-gray-500">Try selecting a different category or search term.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {selectedCategory === "All" ? "All Places" : selectedCategory}
        </h3>
        <span className="text-sm text-gray-600">{places.length} places found</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {places.map((place, index) => (
          <Card 
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-purple-200"
            onClick={() => onPlaceClick(place)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="text-3xl flex-shrink-0">
                  {place.image}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-800 truncate">{place.name}</h4>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span className="truncate">{place.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{place.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {place.description}
                  </p>
                  
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{place.hours}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExplorePlacesGrid;
