
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Edit3, Save, Trash2, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getDestinationDateRanges } from "@/utils/dateUtils";

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: any;
  onUpdateTrip?: (tripData: any) => void;
  onDeleteTrip?: (tripId: number) => void;
}

const EditTripModal = ({ isOpen, onClose, trip, onUpdateTrip, onDeleteTrip }: EditTripModalProps) => {
  const [tripName, setTripName] = useState("");
  const [destinations, setDestinations] = useState<Array<{name: string, startDate: string, endDate: string}>>([]);
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
        if (trip.dates) {
          // Use existing date calculation logic
          const dateRanges = getDestinationDateRanges(trip.dates, trip.coordinates.length);
          const destinationsWithDates = trip.coordinates.map((coord: any, index: number) => ({
            name: coord.name,
            startDate: dateRanges[index]?.startDate ? formatDate(dateRanges[index].startDate) : "",
            endDate: dateRanges[index]?.endDate ? formatDate(dateRanges[index].endDate) : ""
          }));
          setDestinations(destinationsWithDates);
        } else {
          // No dates, initialize with empty dates
          const destinationsWithEmptyDates = trip.coordinates.map((coord: any) => ({
            name: coord.name,
            startDate: "",
            endDate: ""
          }));
          setDestinations(destinationsWithEmptyDates);
        }
      } else {
        // No coordinates, initialize with one empty destination
        setDestinations([{ name: "", startDate: "", endDate: "" }]);
      }
    }
  }, [trip]);

  useEffect(() => {
    // Calculate overall trip dates when destinations change
    calculateTripDates();
  }, [destinations]);

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

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
      const startDate = parseDate(dest.startDate);
      const endDate = parseDate(dest.endDate);

      if (startDate && (!earliestStart || startDate < earliestStart)) {
        earliestStart = startDate;
      }
      if (endDate && (!latestEnd || endDate > latestEnd)) {
        latestEnd = endDate;
      }
    });

    if (earliestStart && latestEnd) {
      const startFormatted = formatDateShort(earliestStart);
      const endFormatted = formatDateShort(latestEnd);
      setCalculatedDates(`${startFormatted} - ${endFormatted}`);
    }
  };

  const parseDate = (dateStr: string): Date | null => {
    try {
      // Parse format like "Jan 15, 2024"
      const parts = dateStr.split(' ');
      if (parts.length !== 3) return null;
      
      const monthMap: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const month = monthMap[parts[0]];
      const day = parseInt(parts[1].replace(',', ''));
      const year = parseInt(parts[2]);
      
      return new Date(year, month, day);
    } catch {
      return null;
    }
  };

  const formatDateShort = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const addDestination = () => {
    setDestinations([...destinations, { name: "", startDate: "", endDate: "" }]);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter((_, i) => i !== index));
    }
  };

  const updateDestination = (index: number, field: string, value: string) => {
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
        dates: calculatedDates,
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
                          <Input
                            placeholder="Start: Jan 15, 2024"
                            value={destination.startDate}
                            onChange={(e) => updateDestination(index, 'startDate', e.target.value)}
                            className="text-xs"
                          />
                          <Input
                            placeholder="End: Jan 20, 2024"
                            value={destination.endDate}
                            onChange={(e) => updateDestination(index, 'endDate', e.target.value)}
                            className="text-xs"
                          />
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
