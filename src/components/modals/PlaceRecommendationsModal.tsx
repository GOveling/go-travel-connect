import { useState } from "react";
import {
  Check,
  X,
  RefreshCw,
  MapPin,
  Calendar,
  Star,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trip, SavedPlace } from "@/types";
import { getSuggestedPlaces } from "@/utils/placeSuggestions";
import {
  calculateDestinationDays,
  getDestinationDates,
} from "@/utils/aiSmartRoute";

interface PlaceRecommendationsModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onAcceptRecommendations: (acceptedPlaces: SavedPlace[]) => void;
}

interface DayRecommendation {
  day: number;
  date: string;
  destinationName: string;
  recommendedPlaces: SavedPlace[];
  acceptedPlaces: Set<string>;
}

const PlaceRecommendationsModal = ({
  trip,
  isOpen,
  onClose,
  onAcceptRecommendations,
}: PlaceRecommendationsModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dayRecommendations, setDayRecommendations] = useState<
    DayRecommendation[]
  >([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  // Generate recommendations for each day/destination
  const generateRecommendations = async () => {
    setIsGenerating(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const destinationDays = calculateDestinationDays(
      trip.dates,
      trip.coordinates.length,
      trip
    );
    const destinationDates = getDestinationDates(
      trip.dates,
      trip.coordinates,
      destinationDays
    );

    const existingPlaceIds = trip.savedPlaces?.map((p) => p.id) || [];

    const recommendations: DayRecommendation[] = [];
    let dayCounter = 1;

    trip.coordinates.forEach((destination, destIndex) => {
      const daysForDestination = destinationDays[destIndex];
      const datesForDestination = destinationDates[destIndex];

      for (let dayInDest = 0; dayInDest < daysForDestination; dayInDest++) {
        const suggestedPlaces = getSuggestedPlaces(
          destination.name,
          existingPlaceIds
        );

        // Get 3-4 places per day, prioritizing high-rated ones
        const placesForDay = suggestedPlaces
          .sort((a, b) => b.rating - a.rating)
          .slice(dayInDest * 3, dayInDest * 3 + 4)
          .slice(0, 3);

        recommendations.push({
          day: dayCounter,
          date: datesForDestination[dayInDest] || `Day ${dayCounter}`,
          destinationName: destination.name,
          recommendedPlaces: placesForDay,
          acceptedPlaces: new Set(),
        });

        dayCounter++;
      }
    });

    setDayRecommendations(recommendations);
    setHasGenerated(true);
    setIsGenerating(false);
  };

  const togglePlaceAcceptance = (dayIndex: number, placeId: string) => {
    setDayRecommendations((prev) =>
      prev.map((day, index) => {
        if (index === dayIndex) {
          const newAccepted = new Set(day.acceptedPlaces);
          if (newAccepted.has(placeId)) {
            newAccepted.delete(placeId);
          } else {
            newAccepted.add(placeId);
          }
          return { ...day, acceptedPlaces: newAccepted };
        }
        return day;
      })
    );
  };

  const refreshDayRecommendations = (dayIndex: number) => {
    const destination = trip.coordinates.find(
      (dest) => dest.name === dayRecommendations[dayIndex].destinationName
    );

    if (destination) {
      const existingPlaceIds = trip.savedPlaces?.map((p) => p.id) || [];
      const allSuggested = getSuggestedPlaces(
        destination.name,
        existingPlaceIds
      );
      const newPlaces = allSuggested
        .filter(
          (place) =>
            !dayRecommendations[dayIndex].recommendedPlaces.some(
              (p) => p.id === place.id
            )
        )
        .slice(0, 3);

      setDayRecommendations((prev) =>
        prev.map((day, index) =>
          index === dayIndex
            ? {
                ...day,
                recommendedPlaces: newPlaces,
                acceptedPlaces: new Set(),
              }
            : day
        )
      );
    }
  };

  const handleAcceptRecommendations = () => {
    const allAcceptedPlaces: SavedPlace[] = [];

    dayRecommendations.forEach((day) => {
      day.recommendedPlaces.forEach((place) => {
        if (day.acceptedPlaces.has(place.id)) {
          allAcceptedPlaces.push({
            ...place,
            id: `accepted-${Date.now()}-${place.id}`,
            destinationName: day.destinationName,
          });
        }
      });
    });

    onAcceptRecommendations(allAcceptedPlaces);

    toast({
      title: "Recommendations Added",
      description: `${allAcceptedPlaces.length} places have been added to your trip.`,
    });

    onClose();
  };

  const totalAcceptedPlaces = dayRecommendations.reduce(
    (total, day) => total + day.acceptedPlaces.size,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center space-x-2">
            <MapPin className="text-blue-600" size={20} />
            <span>AI Place Recommendations</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Discover amazing places for your {trip.name} journey
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {!hasGenerated ? (
            <div className="text-center py-8">
              <MapPin size={48} className="mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Get Personalized Recommendations
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Our AI will suggest popular places for each day of your trip
                based on your destinations and allocated time.
              </p>

              <Button
                onClick={generateRecommendations}
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" size={16} />
                    Generating Recommendations...
                  </>
                ) : (
                  <>
                    <Star className="mr-2" size={16} />
                    Generate Recommendations
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-blue-800 mb-1">
                  Recommendations Ready
                </h4>
                <p className="text-xs text-blue-600">
                  Select the places you'd like to add to your trip. You can
                  accept all or choose individually.
                </p>
              </div>

              <div className="space-y-4">
                {dayRecommendations.map((day, dayIndex) => (
                  <Card key={day.day} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="text-blue-600" size={16} />
                          <span className="text-sm font-medium">
                            Day {day.day}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {day.destinationName}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {day.date}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => refreshDayRecommendations(dayIndex)}
                            className="text-xs h-7"
                          >
                            <RefreshCw size={12} className="mr-1" />
                            Refresh
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {day.recommendedPlaces.map((place) => (
                        <div
                          key={place.id}
                          className={`p-3 rounded-lg border transition-all ${
                            day.acceptedPlaces.has(place.id)
                              ? "bg-green-50 border-green-200"
                              : "bg-white border-gray-200 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-lg">{place.image}</span>
                                <h5 className="font-medium text-gray-800 text-sm">
                                  {place.name}
                                </h5>
                                <Badge className="text-xs bg-gray-100 text-gray-700">
                                  {place.category}
                                </Badge>
                              </div>

                              <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                {place.description}
                              </p>

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Star
                                    size={10}
                                    className="text-yellow-500 fill-current mr-1"
                                  />
                                  {place.rating}
                                </div>
                                <div className="flex items-center">
                                  <Clock size={10} className="mr-1" />
                                  {place.estimatedTime}
                                </div>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant={
                                day.acceptedPlaces.has(place.id)
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() =>
                                togglePlaceAcceptance(dayIndex, place.id)
                              }
                              className={`min-w-[80px] h-8 text-xs ${
                                day.acceptedPlaces.has(place.id)
                                  ? "bg-green-600 hover:bg-green-700"
                                  : ""
                              }`}
                            >
                              {day.acceptedPlaces.has(place.id) ? (
                                <>
                                  <Check size={12} className="mr-1" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <Star size={12} className="mr-1" />
                                  Add
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 text-sm"
                >
                  <X className="mr-2" size={16} />
                  Cancel
                </Button>
                <Button
                  onClick={handleAcceptRecommendations}
                  disabled={totalAcceptedPlaces === 0}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-sm"
                >
                  <Check className="mr-2" size={16} />
                  Add {totalAcceptedPlaces} Selected Place
                  {totalAcceptedPlaces !== 1 ? "s" : ""}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceRecommendationsModal;
