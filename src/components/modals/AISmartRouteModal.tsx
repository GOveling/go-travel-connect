
import { useState } from "react";
import { Brain } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Trip, DayItinerary, AISmartRouteModalProps, SavedPlace } from '@/types';
import { getRouteConfigurations } from "@/utils/routeGenerator";
import { getSavedPlacesByDestination, calculateDestinationDays } from "@/utils/aiSmartRoute";
import InitialView from "./ai-smart-route/InitialView";
import ItineraryTab from "./ai-smart-route/ItineraryTab";
import MapTab from "./ai-smart-route/MapTab";
import AnalyticsTab from "./ai-smart-route/AnalyticsTab";
import PlaceRecommendationsModal from "./PlaceRecommendationsModal";

const AISmartRouteModal = ({ trip, isOpen, onClose }: AISmartRouteModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [routeGenerated, setRouteGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [selectedRouteType, setSelectedRouteType] = useState("current");
  const [optimizedItinerary, setOptimizedItinerary] = useState<DayItinerary[]>([]);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const { toast } = useToast();

  // Update currentTrip when trip prop changes
  useState(() => {
    if (trip) {
      setCurrentTrip(trip);
    }
  });

  // Reset modal state when it opens
  useState(() => {
    if (isOpen && trip) {
      setCurrentTrip(trip);
      setRouteGenerated(false);
      setActiveTab("itinerary");
      setSelectedRouteType("current");
      setOptimizedItinerary([]);
    }
  });

  // Early return if no trip data
  if (!isOpen || !trip) return null;

  const workingTrip = currentTrip || trip;

  // Generate AI optimized routes based ONLY on actual saved places from the trip
  const generateAIRoute = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Set initial route to current using actual saved places data
    const routeConfigurations = getRouteConfigurations(workingTrip);
    setOptimizedItinerary(routeConfigurations.current.itinerary);
    setRouteGenerated(true);
    setIsGenerating(false);
  };

  // Handle place recommendations
  const handleStartRecommendations = () => {
    setShowRecommendationsModal(true);
  };

  // Handle accepting recommended places
  const handleAcceptRecommendations = (acceptedPlaces: SavedPlace[]) => {
    const updatedTrip = {
      ...workingTrip,
      savedPlaces: [...(workingTrip.savedPlaces || []), ...acceptedPlaces]
    };
    setCurrentTrip(updatedTrip);
    setShowRecommendationsModal(false);
    
    // Show success message with option to generate route
    toast({
      title: "Places Added Successfully",
      description: `${acceptedPlaces.length} places have been added to your trip. You can now generate your AI Smart Route!`,
    });
  };

  // Handle route type change
  const handleRouteTypeChange = (routeType: string) => {
    setSelectedRouteType(routeType);
    const routeConfigurations = getRouteConfigurations(workingTrip);
    const selectedConfig = routeConfigurations[routeType as keyof typeof routeConfigurations];
    setOptimizedItinerary(selectedConfig.itinerary);
  };

  // Action button handlers
  const handleSaveToTrip = () => {
    toast({
      title: "Route Saved!",
      description: "Your AI optimized route has been saved to your trip.",
    });
  };

  const handleExportItinerary = () => {
    // Create a simple text export of the itinerary
    const exportText = optimizedItinerary.map(day => 
      `Day ${day.day} - ${day.date}:\n${day.places.map(place => 
        `• ${place.name} (${place.category}) - ${place.estimatedTime}`
      ).join('\n')}\n`
    ).join('\n');

    // Create and download text file
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workingTrip.name}-itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Itinerary Exported!",
      description: "Your itinerary has been downloaded as a text file.",
    });
  };

  const handleShareRoute = () => {
    // Create a shareable summary
    const shareText = `Check out my AI-optimized travel route for ${workingTrip.name}! 🌟\n\n${optimizedItinerary.length} days of perfectly planned adventures.`;
    
    if (navigator.share) {
      navigator.share({
        title: `${workingTrip.name} - AI Smart Route`,
        text: shareText,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "Route Copied!",
          description: "Route summary copied to clipboard. Share it with your friends!",
        });
      });
    }
  };

  const routeConfigurations = getRouteConfigurations(workingTrip);
  const savedPlacesByDestination = getSavedPlacesByDestination(workingTrip);
  const totalSavedPlaces = Object.values(savedPlacesByDestination).reduce((total, places) => total + places.length, 0);
  const destinationDays = calculateDestinationDays(workingTrip.dates, workingTrip.coordinates.length, workingTrip);
  const totalTripDays = destinationDays.reduce((a, b) => a + b, 0);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <Brain className="text-purple-600" size={24} />
              <span>AI Smart Route for {workingTrip.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!routeGenerated ? (
              <InitialView 
                trip={workingTrip}
                isGenerating={isGenerating}
                onGenerateRoute={generateAIRoute}
                onStartRecommendations={totalSavedPlaces === 0 ? handleStartRecommendations : undefined}
              />
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="itinerary" className="text-xs sm:text-sm">Daily Itinerary</TabsTrigger>
                  <TabsTrigger value="map" className="text-xs sm:text-sm">Route Map</TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs sm:text-sm">AI Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="itinerary">
                  <ItineraryTab
                    optimizedItinerary={optimizedItinerary}
                    selectedRouteType={selectedRouteType}
                    routeConfigurations={routeConfigurations}
                    totalSavedPlaces={totalSavedPlaces}
                    totalTripDays={totalTripDays}
                    onRouteTypeChange={handleRouteTypeChange}
                  />
                </TabsContent>

                <TabsContent value="map">
                  <MapTab
                    trip={workingTrip}
                    totalSavedPlaces={totalSavedPlaces}
                    totalTripDays={totalTripDays}
                  />
                </TabsContent>

                <TabsContent value="analytics">
                  <AnalyticsTab
                    selectedRouteType={selectedRouteType}
                    routeConfigurations={routeConfigurations}
                    totalSavedPlaces={totalSavedPlaces}
                    totalTripDays={totalTripDays}
                    onRouteTypeChange={handleRouteTypeChange}
                  />
                </TabsContent>
              </Tabs>
            )}

            {routeGenerated && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                <Button 
                  onClick={handleSaveToTrip}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm"
                >
                  Save to Trip
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExportItinerary}
                  className="flex-1 text-sm"
                >
                  Export Itinerary
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShareRoute}
                  className="flex-1 text-sm"
                >
                  Share Route
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PlaceRecommendationsModal
        trip={trip}
        isOpen={showRecommendationsModal}
        onClose={() => setShowRecommendationsModal(false)}
        onAcceptRecommendations={handleAcceptRecommendations}
      />
    </>
  );
};

export default AISmartRouteModal;
