
import { Brain, Clock, MapPin, Route, Star, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trip } from "@/types";
import { calculateDestinationDays, getSavedPlacesByDestination } from "@/utils/aiSmartRoute";

interface InitialViewProps {
  trip: Trip;
  isGenerating: boolean;
  onGenerateRoute: () => void;
  onStartRecommendations?: () => void;
}

const InitialView = ({ trip, isGenerating, onGenerateRoute, onStartRecommendations }: InitialViewProps) => {
  const savedPlacesByDestination = getSavedPlacesByDestination(trip);
  const totalSavedPlaces = Object.values(savedPlacesByDestination).reduce((total, places) => total + places.length, 0);
  const destinationDays = calculateDestinationDays(trip.dates, trip.coordinates.length, trip);
  const totalTripDays = destinationDays.reduce((a, b) => a + b, 0);

  return (
    <div className="text-center py-12">
      <Brain size={64} className="mx-auto mb-6 text-purple-600" />
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        AI Route Optimization with Your Saved Places
      </h3>
      <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
        Our AI will analyze your {totalSavedPlaces} saved places across {trip.coordinates.length} destinations 
        over {totalTripDays} days, considering the allocated time per destination, opening hours, crowd patterns, 
        travel distances, and optimal timing to create the perfect itinerary.
      </p>
      
      {/* Day Allocation Preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
        <h4 className="font-medium text-blue-800 mb-3">Current Day Allocation</h4>
        <div className="grid grid-cols-1 gap-2">
          {trip.coordinates.map((destination, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-blue-700">{destination.name}:</span>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-medium">{destinationDays[index]} day{destinationDays[index] > 1 ? 's' : ''}</span>
                <span className="text-blue-500">
                  ({savedPlacesByDestination[destination.name]?.length || 0} saved places)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {totalSavedPlaces === 0 ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
          <MapPin className="mx-auto mb-2 text-orange-600" size={32} />
          <h4 className="font-medium text-orange-800 mb-2">No Saved Places Found</h4>
          <p className="text-sm text-orange-600 mb-4">
            Get AI-powered place recommendations for your destinations to create an optimized route.
          </p>
          
          {onStartRecommendations && (
            <Button
              onClick={onStartRecommendations}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 mb-3"
            >
              <Lightbulb className="mr-2" size={16} />
              Get Place Recommendations
            </Button>
          )}
          
          <p className="text-xs text-orange-500">
            Or add places manually in your trip details first
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <MapPin className="mx-auto mb-2 text-blue-600" size={24} />
              <p className="text-sm font-medium text-blue-800">Your Saved Places</p>
              <p className="text-xs text-blue-600">{totalSavedPlaces} places</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <Clock className="mx-auto mb-2 text-green-600" size={24} />
              <p className="text-sm font-medium text-green-800">Time Optimization</p>
              <p className="text-xs text-green-600">{totalTripDays} days analyzed</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <Route className="mx-auto mb-2 text-purple-600" size={24} />
              <p className="text-sm font-medium text-purple-800">Route Planning</p>
              <p className="text-xs text-purple-600">3 route options</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <Star className="mx-auto mb-2 text-orange-600" size={24} />
              <p className="text-sm font-medium text-orange-800">Priority Ranking</p>
              <p className="text-xs text-orange-600">Your preferences</p>
            </div>
          </div>

          <Button 
            onClick={onGenerateRoute}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3"
          >
            {isGenerating ? (
              <>
                <Brain className="animate-spin mr-2" size={20} />
                Analyzing Your {totalSavedPlaces} Saved Places...
              </>
            ) : (
              <>
                <Brain className="mr-2" size={20} />
                Generate AI Smart Route
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default InitialView;
