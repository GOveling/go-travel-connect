import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, MapPin, Users, Edit3, Save, Trash2, Plus, X, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { getDestinationDateRanges } from "@/utils/dateUtils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: any;
  onUpdateTrip?: (tripData: any) => void;
  onDeleteTrip?: (tripId: number) => void;
}

const EditTripModal = ({ isOpen, onClose, trip, onUpdateTrip, onDeleteTrip }: EditTripModalProps) => {
  const [tripName, setTripName] = useState("");
  const [destinations, setDestinations] = useState<Array<{name: string, startDate: Date | undefined, endDate: Date | undefined}>>([]);
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

  const addDestination = () => {
    setDestinations([...destinations, { name: "", startDate: undefined, endDate: undefined }]);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    }
  };

  const updateDestination = (index: number, field: string, value: string | Date | undefined) => {
    const updated = destinations.map((dest, i) => 
      i === index ? { ...dest, [field]: value } : dest
    );
    setDestinations(updated);
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
              <div>
                <Label htmlFor="tripName" className="text-sm font-medium">Trip Name</Label>
                <Input
                  id="tripName"
                  placeholder="My Amazing Trip"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Destinations with individual dates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Destinations & Dates</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addDestination}
                    className="h-6 px-2"
                  >
                    <Plus size={12} className="mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {destinations.map((destination, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Destination {index + 1}</span>
                        {destinations.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDestination(index)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X size={12} />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="City name"
                          value={destination.name}
                          onChange={(e) => updateDestination(index, 'name', e.target.value)}
                          className="text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal text-xs h-8",
                                    !destination.startDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-1 h-3 w-3" />
                                  {destination.startDate ? format(destination.startDate, "MMM d") : <span>Start</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={destination.startDate}
                                  onSelect={(date) => updateDestination(index, 'startDate', date)}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal text-xs h-8",
                                    !destination.endDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-1 h-3 w-3" />
                                  {destination.endDate ? format(destination.endDate, "MMM d") : <span>End</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={destination.endDate}
                                  onSelect={(date) => updateDestination(index, 'endDate', date)}
                                  disabled={(date) => destination.startDate ? date < destination.startDate : false}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculated trip dates */}
              {calculatedDates && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">Total Trip Duration</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">{calculatedDates}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="travelers" className="text-sm font-medium">Travelers</Label>
                  <Input
                    id="travelers"
                    type="number"
                    min="1"
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="budget" className="text-sm font-medium">Budget</Label>
                <Input
                  id="budget"
                  placeholder="$2,500 per person"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <textarea
                  id="description"
                  className="w-full mt-1 p-2 border rounded-md text-sm resize-none"
                  rows={3}
                  placeholder="Describe your trip..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2 text-red-700">
                <Trash2 className="text-red-600" size={20} />
                <span>Danger Zone</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 mb-3">
                Once you delete a trip, there is no going back. Please be certain.
              </p>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Trip
              </Button>
            </CardContent>
          </Card>

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
