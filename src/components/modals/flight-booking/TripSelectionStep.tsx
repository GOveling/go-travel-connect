
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Plane, Brain } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { extractStartDate, extractEndDate } from "./flightBookingUtils";
import { getAIFlightTimingRecommendation, adjustFlightDateBasedOnAI } from "./aiFlightTimingUtils";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface MultiCityFlight {
  from: string;
  to: string;
  departDate: string;
  passengers: number;
  class: string;
}

interface TripSelectionStepProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  setTripType: (type: 'round-trip' | 'one-way' | 'multi-city') => void;
  selectedTrip: number | null;
  currentLocation: string;
  activeTrips: any[];
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  multiCityFlights: MultiCityFlight[];
  setMultiCityFlights: (flights: MultiCityFlight[] | ((prev: MultiCityFlight[]) => MultiCityFlight[])) => void;
  onTripSelect: (tripId: number) => void;
  onContinue: () => void;
}

const TripSelectionStep = ({
  tripType,
  setTripType,
  selectedTrip,
  currentLocation,
  activeTrips,
  formData,
  setFormData,
  multiCityFlights,
  setMultiCityFlights,
  onTripSelect,
  onContinue
}: TripSelectionStepProps) => {
  const [showAIRecommendation, setShowAIRecommendation] = useState(false);
  const { toast } = useToast();

  const handleTripSelection = (tripId: number) => {
    onTripSelect(tripId);
    const selectedTripData = activeTrips.find(trip => trip.id === tripId);
    
    if (selectedTripData) {
      console.log('🤖 AI Flight Protocol - Processing trip:', selectedTripData);
      
      // Get trip destinations from coordinates
      const destinations = selectedTripData.coordinates || [];
      const tripStartDate = extractStartDate(selectedTripData.dates);
      const tripEndDate = extractEndDate(selectedTripData.dates);
      
      if (destinations.length === 0) {
        toast({
          title: "⚠️ No se encontraron destinos",
          description: "El viaje seleccionado no tiene destinos configurados.",
        });
        return;
      }

      const firstDestination = destinations[0].name;
      
      // 🤖 AI Protocol: Get flight timing recommendation
      const aiRecommendation = getAIFlightTimingRecommendation(
        currentLocation,
        firstDestination,
        tripStartDate
      );

      // Calculate optimal departure date
      const optimizedDepartDate = adjustFlightDateBasedOnAI(tripStartDate, aiRecommendation);
      
      if (destinations.length > 1) {
        // Multi-city trip with return flight
        setTripType('multi-city');
        
        // Create multi-city flights with AI optimization
        const aiOptimizedFlights: MultiCityFlight[] = [];
        
        // First flight: current location to first destination
        aiOptimizedFlights.push({
          from: currentLocation,
          to: firstDestination,
          departDate: optimizedDepartDate,
          passengers: selectedTripData.travelers || 1,
          class: 'economy'
        });

        // Calculate days per destination (distribute total days among destinations)
        const totalDays = tripEndDate ? 
          Math.ceil((new Date(tripEndDate).getTime() - new Date(tripStartDate).getTime()) / (1000 * 60 * 60 * 24)) : 
          destinations.length * 3; // fallback to 3 days per destination
        
        const daysPerDestination = Math.max(2, Math.floor(totalDays / destinations.length));

        // Intermediate flights between destinations
        for (let i = 1; i < destinations.length; i++) {
          const fromDest = destinations[i - 1].name;
          const toDest = destinations[i].name;
          
          // Calculate intermediate date based on days per destination
          const intermediateDate = new Date(tripStartDate);
          intermediateDate.setDate(intermediateDate.getDate() + (i * daysPerDestination));
          
          // Get AI recommendation for this segment
          const segmentRecommendation = getAIFlightTimingRecommendation(
            fromDest,
            toDest,
            intermediateDate.toISOString().split('T')[0]
          );
          
          const optimizedSegmentDate = adjustFlightDateBasedOnAI(
            intermediateDate.toISOString().split('T')[0], 
            segmentRecommendation
          );
          
          aiOptimizedFlights.push({
            from: fromDest,
            to: toDest,
            departDate: optimizedSegmentDate,
            passengers: selectedTripData.travelers || 1,
            class: 'economy'
          });
        }

        // 🛬 RETURN FLIGHT: Add flight from last destination back to origin
        if (tripEndDate) {
          const lastDestination = destinations[destinations.length - 1].name;
          
          // Get AI recommendation for return flight
          const returnRecommendation = getAIFlightTimingRecommendation(
            lastDestination,
            currentLocation,
            tripEndDate
          );
          
          const optimizedReturnDate = adjustFlightDateBasedOnAI(tripEndDate, returnRecommendation);
          
          aiOptimizedFlights.push({
            from: lastDestination,
            to: currentLocation,
            departDate: optimizedReturnDate,
            passengers: selectedTripData.travelers || 1,
            class: 'economy'
          });

          console.log('🛬 Return flight added:', {
            from: lastDestination,
            to: currentLocation,
            date: optimizedReturnDate,
            recommendation: returnRecommendation
          });
        }

        setMultiCityFlights(aiOptimizedFlights);
        setShowAIRecommendation(true);

        // Show AI automation toast with return flight info
        const returnFlightInfo = tripEndDate ? " + vuelo de retorno" : "";
        toast({
          title: "🤖 IA optimizó vuelos multi-destino",
          description: `${aiOptimizedFlights.length} vuelos planificados${returnFlightInfo}. ${aiRecommendation.reason}`,
        });

      } else {
        // Single destination trip
        const endDate = extractEndDate(selectedTripData.dates);
        
        if (endDate) {
          setTripType('round-trip');
          setFormData(prev => ({
            ...prev,
            from: currentLocation,
            to: firstDestination,
            departDate: optimizedDepartDate,
            returnDate: endDate,
            passengers: selectedTripData.travelers || 1
          }));
        } else {
          setTripType('one-way');
          setFormData(prev => ({
            ...prev,
            from: currentLocation,
            to: firstDestination,
            departDate: optimizedDepartDate,
            passengers: selectedTripData.travelers || 1
          }));
        }

        setShowAIRecommendation(true);

        // Show AI automation toast
        toast({
          title: "🤖 IA optimizó fechas de vuelo",
          description: `${aiRecommendation.reason} Distancia: ${aiRecommendation.distance}km`,
        });
      }

      console.log('🤖 AI Flight Optimization Applied:', {
        originalDate: tripStartDate,
        optimizedDate: optimizedDepartDate,
        totalFlights: destinations.length > 1 ? aiOptimizedFlights.length : 1,
        hasReturnFlight: destinations.length > 1 && tripEndDate ? true : false,
        recommendation: aiRecommendation
      });
    }
  };

  const canContinue = () => {
    if (selectedTrip === null) return false;
    
    if (tripType === 'multi-city') {
      return multiCityFlights.length >= 2;
    }
    
    return formData.from && formData.to && formData.departDate;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Select Trip Type</h3>
        <RadioGroup value={tripType} onValueChange={(value) => setTripType(value as 'round-trip' | 'one-way' | 'multi-city')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="round-trip" id="round-trip" />
            <Label htmlFor="round-trip">Round Trip</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one-way" id="one-way" />
            <Label htmlFor="one-way">One Way</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multi-city" id="multi-city" />
            <Label htmlFor="multi-city">Multi-city</Label>
          </div>
        </RadioGroup>
      </div>

      {/* AI Recommendation Display */}
      {showAIRecommendation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">IA Optimizó tu Vuelo</span>
            </div>
            <p className="text-sm text-blue-700">
              Las fechas de vuelo han sido optimizadas automáticamente basándose en la distancia 
              y logística de viaje para maximizar tu experiencia.
              {tripType === 'multi-city' && multiCityFlights.length > 2 && (
                <span className="block mt-1 font-medium">
                  ✈️ Incluye vuelo de retorno al origen
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Select from Your Active Trips</h3>
        <div className="space-y-2">
          {activeTrips.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                <p>No active trips found</p>
                <p className="text-sm">Create a trip first to use auto-fill</p>
              </CardContent>
            </Card>
          ) : (
            activeTrips.map((trip) => (
              <Card 
                key={trip.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTrip === trip.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleTripSelection(trip.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{trip.name}</h4>
                    <Badge variant="secondary" className="ml-2">
                      {trip.status || 'Active'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin size={14} />
                      <span>{trip.destination}</span>
                      {trip.coordinates && trip.coordinates.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          {trip.coordinates.length} destinos
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>{trip.dates}</span>
                    </div>
                    
                    {trip.travelers && (
                      <div className="flex items-center space-x-2">
                        <Users size={14} />
                        <span>{trip.travelers} travelers</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Button 
        onClick={onContinue}
        className="w-full"
        disabled={!canContinue()}
      >
        <Plane size={16} className="mr-2" />
        Continue to Flight Details
      </Button>
    </div>
  );
};

export default TripSelectionStep;
