
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useHomeState } from "@/hooks/useHomeState";
import FlightBookingHeader from "./flight-booking/FlightBookingHeader";
import FlightBookingTabs from "./flight-booking/FlightBookingTabs";
import FlightBookingSearch from "./flight-booking/FlightBookingSearch";
import MyFlightsView from "./flight-booking/MyFlightsView";

interface FlightBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

const FlightBookingModal = ({ isOpen, onClose }: FlightBookingModalProps) => {
  const [activeTab, setActiveTab] = useState("search");
  const [currentStep, setCurrentStep] = useState(1);
  const [tripType, setTripType] = useState<'round-trip' | 'one-way' | 'multi-city'>('round-trip');
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isDepartDateOpen, setIsDepartDateOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy'
  });
  const [multiCityFlights, setMultiCityFlights] = useState<MultiCityFlight[]>([
    { from: '', to: '', departDate: '', passengers: 1, class: 'economy' },
    { from: '', to: '', departDate: '', passengers: 1, class: 'economy' }
  ]);
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const { trips } = useHomeState();
  const { toast } = useToast();

  const handleTripSelection = (tripId: number) => {
    setSelectedTrip(tripId);
  };

  const handleComplete = () => {
    toast({
      title: "Flight Search Started",
      description: "Finding the best flights for your trip...",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        <FlightBookingHeader onClose={onClose} />

        <div className="p-4">
          <FlightBookingTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <FlightBookingSearch
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            tripType={tripType}
            setTripType={setTripType}
            formData={formData}
            setFormData={setFormData}
            multiCityFlights={multiCityFlights}
            setMultiCityFlights={setMultiCityFlights}
            selectedTrip={selectedTrip}
            handleTripSelection={handleTripSelection}
            trips={trips}
            isDateRangeOpen={isDateRangeOpen}
            setIsDateRangeOpen={setIsDateRangeOpen}
            isDepartDateOpen={isDepartDateOpen}
            setIsDepartDateOpen={setIsDepartDateOpen}
            onComplete={handleComplete}
          />
          
          <TabsContent value="my-flights" className="mt-4">
            <MyFlightsView 
              onBackToOptions={() => setActiveTab("search")}
              onAddFlight={() => setActiveTab("search")}
            />
          </TabsContent>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlightBookingModal;
