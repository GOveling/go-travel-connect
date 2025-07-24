import { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type {
  Trip,
  DayItinerary,
  AISmartRouteModalProps,
  SavedPlace,
} from "@/types";
import { getRouteConfigurations } from "@/utils/routeGenerator";
import {
  getSavedPlacesByDestination,
  calculateDestinationDays,
} from "@/utils/aiSmartRoute";
import { useMapData } from "@/hooks/useMapData";
import InitialView from "./ai-smart-route/InitialView";
import ItineraryTab from "./ai-smart-route/ItineraryTab";
import MapTab from "./ai-smart-route/MapTab";
import AnalyticsTab from "./ai-smart-route/AnalyticsTab";
import PlaceRecommendationsModal from "./PlaceRecommendationsModal";

const AISmartRouteModal = ({
  trip,
  isOpen,
  onClose,
}: AISmartRouteModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [routeGenerated, setRouteGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [selectedRouteType, setSelectedRouteType] = useState("balanced");
  const [optimizedItinerary, setOptimizedItinerary] = useState<DayItinerary[]>(
    []
  );
  const [showRecommendationsModal, setShowRecommendationsModal] =
    useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const { toast } = useToast();

  // Use map data hook for distance calculations
  const { calculateTripDistances, calculateOptimizedRoute } = useMapData([]);

  // Update currentTrip when trip prop changes
  useEffect(() => {
    if (trip) {
      setCurrentTrip(trip);
    }
  }, [trip]);

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen && trip) {
      setCurrentTrip(trip);
      setRouteGenerated(false);
      setActiveTab("itinerary");
      setSelectedRouteType("balanced");
      setOptimizedItinerary([]);
    }
  }, [isOpen, trip]);

  // Early return if no trip data
  if (!isOpen || !trip) return null;

  const workingTrip = currentTrip || trip;

  // Generate AI optimized route using real distance data
  const generateAIRoute = async () => {
    setIsGenerating(true);

    try {
      // Calculate real distances and optimized route
      const distanceMatrix = calculateTripDistances(workingTrip);
      const optimizedRoute = calculateOptimizedRoute(workingTrip);

      console.log("Distance matrix:", distanceMatrix);
      console.log("Optimized route:", optimizedRoute);

      // Generate single balanced route with real data
      const { data, error } = await supabase.functions.invoke(
        "ai-route-generator",
        {
          body: {
            tripId: workingTrip.id,
            tripData: workingTrip,
            routeType: "balanced",
            distanceMatrix,
            optimizedRoute,
          },
        }
      );

      if (error) {
        console.error("Error generating AI route:", error);
        // Fallback to static generation
        const routeConfigurations = getRouteConfigurations(workingTrip);
        setOptimizedItinerary(routeConfigurations.current.itinerary);
      } else {
        setOptimizedItinerary(data.itinerary);
      }

      setRouteGenerated(true);

      toast({
        title: "AI Smart Route Generated!",
        description:
          "Your intelligent route has been optimized using real distance data and AI.",
      });
    } catch (error) {
      console.error("Error generating AI route:", error);
      // Fallback to static generation
      const routeConfigurations = getRouteConfigurations(workingTrip);
      setOptimizedItinerary(routeConfigurations.current.itinerary);
      setRouteGenerated(true);

      toast({
        title: "Route Generated",
        description:
          "Using fallback route generation. AI optimization is temporarily unavailable.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle place recommendations
  const handleStartRecommendations = () => {
    setShowRecommendationsModal(true);
  };

  // Handle accepting recommended places
  const handleAcceptRecommendations = (acceptedPlaces: SavedPlace[]) => {
    const updatedTrip = {
      ...workingTrip,
      savedPlaces: [...(workingTrip.savedPlaces || []), ...acceptedPlaces],
    };
    setCurrentTrip(updatedTrip);
    setShowRecommendationsModal(false);

    // Show success message with option to generate route
    toast({
      title: "Places Added Successfully",
      description: `${acceptedPlaces.length} places have been added to your trip. You can now generate your AI Smart Route!`,
    });
  };

  // Since we only have one balanced route, this function is simplified
  const handleRouteTypeChange = (routeType: string) => {
    setSelectedRouteType(routeType);
    // Keep the same optimized itinerary since we only generate one balanced route
  };

  // Action button handlers
  const handleSaveToTrip = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("ai_itineraries").upsert({
        trip_id: workingTrip.id,
        user_id: user.id,
        route_type: "balanced",
        itinerary_data: JSON.parse(
          JSON.stringify({ itinerary: optimizedItinerary })
        ),
      });

      if (error) throw error;

      toast({
        title: "Route Saved!",
        description: "Your AI optimized route has been saved to your trip.",
      });
    } catch (error) {
      console.error("Error saving route:", error);
      toast({
        title: "Error",
        description: "Failed to save route. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportItinerary = () => {
    // Create a simple text export of the itinerary
    const exportText = optimizedItinerary
      .map(
        (day) =>
          `Day ${day.day} - ${day.date}:\n${day.places
            .map(
              (place) =>
                `• ${place.name} (${place.category}) - ${place.estimatedTime}`
            )
            .join("\n")}\n`
      )
      .join("\n");

    // Create and download text file
    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
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
          description:
            "Route summary copied to clipboard. Share it with your friends!",
        });
      });
    }
  };

  const routeConfigurations = getRouteConfigurations(workingTrip);
  const savedPlacesByDestination = getSavedPlacesByDestination(workingTrip);
  const totalSavedPlaces = Object.values(savedPlacesByDestination).reduce(
    (total, places) => total + places.length,
    0
  );
  const destinationDays = calculateDestinationDays(
    workingTrip.dates,
    workingTrip.coordinates.length,
    workingTrip
  );
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
                onStartRecommendations={
                  totalSavedPlaces === 0
                    ? handleStartRecommendations
                    : undefined
                }
              />
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="itinerary" className="text-xs sm:text-sm">
                    Daily Itinerary
                  </TabsTrigger>
                  <TabsTrigger value="map" className="text-xs sm:text-sm">
                    Route Map
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs sm:text-sm">
                    AI Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="itinerary">
                  <ItineraryTab
                    optimizedItinerary={optimizedItinerary}
                    selectedRouteType="balanced"
                    routeConfigurations={{
                      balanced: {
                        itinerary: optimizedItinerary,
                        name: "Balanced Route",
                        description:
                          "AI-optimized balanced route using real distance data",
                        duration: `${totalTripDays} days`,
                        efficiency: "High",
                      },
                    }}
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
                    selectedRouteType="balanced"
                    routeConfigurations={{
                      balanced: {
                        itinerary: optimizedItinerary,
                        name: "Balanced Route",
                        description:
                          "AI-optimized balanced route using real distance data",
                        duration: `${totalTripDays} days`,
                        efficiency: "High",
                      },
                    }}
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
