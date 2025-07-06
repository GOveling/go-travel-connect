
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Edit3, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { getDestinationDateRanges } from "@/utils/dateUtils";
import { format } from "date-fns";
import DestinationForm from "./edit-trip/DestinationForm";
import TripBasicInfo from "./edit-trip/TripBasicInfo";
import DangerZone from "./edit-trip/DangerZone";

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: any;
  onUpdateTrip?: (tripData: any) => void;
  onDeleteTrip?: (tripId: string | number) => void;
}

interface Destination {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const EditTripModal = ({ isOpen, onClose, trip, onUpdateTrip, onDeleteTrip }: EditTripModalProps) => {
  const [tripName, setTripName] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [travelers, setTravelers] = useState("1");
  const [status, setStatus] = useState("planning");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [calculatedDates, setCalculatedDates] = useState("");

  useEffect(() => {
    if (trip) {
      setTripName(trip.name || "");
      setTravelers(trip.travelers?.toString() || "1");
      setStatus(trip.status || "planning");
      setBudget(trip.budget || "");
      setDescription(trip.description || "");

      // Initialize destinations from trip coordinates
      if (trip.coordinates && trip.coordinates.length > 0) {
        if (trip.dates && trip.dates !== "Dates TBD") {
          // Use existing date calculation logic
          const dateRanges = getDestinationDateRanges(trip.dates, trip.coordinates.length);
          const destinationsWithDates = trip.coordinates.map((coord: any, index: number) => ({
            name: coord.name,
            startDate: dateRanges[index]?.startDate || undefined,
            endDate: dateRanges[index]?.endDate || undefined
          }));
          setDestinations(destinationsWithDates);
        } else {
          // No dates, initialize with empty dates
          const destinationsWithEmptyDates = trip.coordinates.map((coord: any) => ({
            name: coord.name,
            startDate: undefined,
            endDate: undefined
          }));
          setDestinations(destinationsWithEmptyDates);
        }
      } else {
        // No coordinates, initialize with one empty destination
        setDestinations([{ name: "", startDate: undefined, endDate: undefined }]);
      }
    }
  }, [trip]);

  useEffect(() => {
    // Calculate overall trip dates when destinations change
    calculateTripDates();
  }, [destinations]);

  const calculateTripDates = () => {
    const validDestinations = destinations.filter(dest => dest.startDate && dest.endDate);
    if (validDestinations.length === 0) {
      setCalculatedDates("");
      return;
    }

    // Find earliest start date and latest end date
    let earliestStart: Date | null = null;
    let latestEnd: Date | null = null;

    validDestinations.forEach(dest => {
      if (dest.startDate && (!earliestStart || dest.startDate < earliestStart)) {
        earliestStart = dest.startDate;
      }
      if (dest.endDate && (!latestEnd || dest.endDate > latestEnd)) {
        latestEnd = dest.endDate;
      }
    });

    if (earliestStart && latestEnd) {
      const startFormatted = format(earliestStart, "MMM d");
      const endFormatted = format(latestEnd, "MMM d, yyyy");
      setCalculatedDates(`${startFormatted} - ${endFormatted}`);
    }
  };

  const handleSave = () => {
    if (onUpdateTrip && trip) {
      // Create coordinates from destinations
      const coordinates = destinations.filter(dest => dest.name).map(dest => ({
        name: dest.name,
        lat: 0, // You might want to add geocoding here
        lng: 0
      }));

      onUpdateTrip({
        ...trip,
        name: tripName,
        destination: destinations.map(d => d.name).filter(Boolean).join(' → '),
        dates: calculatedDates || "Dates TBD",
        travelers: parseInt(travelers),
        status: status,
        budget: budget,
        description: description,
        coordinates: coordinates
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteTrip && trip) {
      onDeleteTrip(trip.id);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="text-4xl mb-2">{trip?.image || "✈️"}</div>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center justify-center space-x-2">
            <Edit3 size={20} />
            <span>Edit Trip</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">Update your trip details</p>
        </DialogHeader>

        <div className="space-y-4 p-1">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <MapPin className="text-blue-600" size={20} />
                <span>Trip Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <TripBasicInfo
                tripName={tripName}
                onTripNameChange={setTripName}
                travelers={travelers}
                onTravelersChange={setTravelers}
                status={status}
                onStatusChange={setStatus}
                budget={budget}
                onBudgetChange={setBudget}
                description={description}
                onDescriptionChange={setDescription}
              />

              <DestinationForm
                destinations={destinations}
                onDestinationsChange={setDestinations}
                calculatedDates={calculatedDates}
              />
            </CardContent>
          </Card>

          <DangerZone onDelete={handleDelete} />

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTripModal;
