import { useState } from "react";
import { Camera, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Trip {
  id: string;
  name: string;
  destination: string;
  dates: string;
  status: string;
  image: string;
}

interface TripPhotobookSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
}

const TripPhotobookSelectorModal = ({
  isOpen,
  onClose,
  trips,
  onSelectTrip,
}: TripPhotobookSelectorModalProps) => {
  // Filter only planned trips (upcoming and planning status)
  const plannedTrips = trips.filter(
    (trip) => trip.status === "upcoming" || trip.status === "planning"
  );

  const handleTripSelect = (trip: Trip) => {
    onSelectTrip(trip);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-center text-lg font-semibold text-gray-800 flex items-center justify-center gap-2">
            <Camera size={20} className="text-purple-600" />
            Select Trip Photobook
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 px-1">
          {plannedTrips.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 text-center mb-4">
                Choose which trip photobook to add your image to
              </p>

              {plannedTrips.map((trip) => (
                <Card
                  key={trip.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-purple-200"
                  onClick={() => handleTripSelect(trip)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="text-2xl flex-shrink-0">
                          {trip.image}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">
                            {trip.name}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">
                            {trip.destination}
                          </p>
                          <p className="text-xs text-gray-500">{trip.dates}</p>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              trip.status === "upcoming"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {trip.status === "upcoming"
                              ? "Upcoming"
                              : "Planning"}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Camera className="text-gray-400" size={24} />
              </div>
              <div>
                <p className="text-gray-600 mb-2">No planned trips found</p>
                <p className="text-sm text-gray-500">
                  Create a trip first to add photos to its photobook
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TripPhotobookSelectorModal;
