import { useState } from 'react';
import { Brain } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { aiRoutesService } from "@/services/aiRoutesApi";
import type { Trip } from "@/types";

interface HotelRecommendation {
  name: string;
  lat: number;
  lon: number;
  rating: number;
  price_level: string;
  distance_to_center: number;
  amenities: string[];
}

interface HotelRecommendationsModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onSelectHotel: (hotel: HotelRecommendation) => void;
}

const HotelRecommendationsModal = ({
  trip,
  isOpen,
  onClose,
  onSelectHotel,
}: HotelRecommendationsModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<HotelRecommendation[]>([]);
  const { toast } = useToast();

  const loadHotelRecommendations = async () => {
    if (!trip.savedPlaces || trip.savedPlaces.length === 0) {
      toast({
        title: "No Places Selected",
        description: "Please add some places to your trip first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const places = trip.savedPlaces.map(place => ({
        name: place.name,
        lat: place.lat || 0,
        lon: place.lng || 0,
        type: place.category?.toLowerCase() || 'point_of_interest'
      }));

      const response = await aiRoutesService.recommendHotels({
        places,
        max_recommendations: 3
      });

      setRecommendations(response.hotels || []);
    } catch (error) {
      console.error('Error loading hotel recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load hotel recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center space-x-3">
            <Brain className="text-purple-600" size={24} />
            <span>AI Hotel Recommendations</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Let our AI find the perfect hotels based on your itinerary
              </p>
              <Button
                onClick={loadHotelRecommendations}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? "Finding Hotels..." : "Get Hotel Recommendations"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((hotel, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg">{hotel.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1 mt-2">
                    <p>Rating: {hotel.rating} ⭐</p>
                    <p>Price Level: {hotel.price_level}</p>
                    <p>Distance to Center: {hotel.distance_to_center.toFixed(1)}km</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {hotel.amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => onSelectHotel(hotel)}
                    className="w-full mt-3"
                    variant="outline"
                  >
                    Select Hotel
                  </Button>
                </div>
              ))}
              <Button
                onClick={loadHotelRecommendations}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                Refresh Recommendations
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotelRecommendationsModal;
