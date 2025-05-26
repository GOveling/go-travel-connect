
import { useState, useEffect } from "react";
import { X, Camera, MapPin, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AddToTripModal from "./AddToTripModal";

interface InstaTripImage {
  id: string;
  src: string;
  addedAt: number;
  text?: string;
  location?: string;
  tripId?: number;
}

interface Trip {
  id: number;
  name: string;
  destination: string;
  dates: string;
  status: string;
  image: string;
}

interface InstaTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: InstaTripImage[];
  onRemoveImage: (id: string) => void;
}

const InstaTripModal = ({ isOpen, onClose, images, onRemoveImage }: InstaTripModalProps) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);
  const [selectedImageForTrip, setSelectedImageForTrip] = useState<InstaTripImage | null>(null);

  // Mock trips data - in a real app this would come from props or context
  const trips: Trip[] = [
    {
      id: 1,
      name: "European Adventure",
      destination: "Paris → Rome → Barcelona",
      dates: "Dec 15 - Dec 25, 2024",
      status: "upcoming",
      image: "🇪🇺"
    },
    {
      id: 2,
      name: "Tokyo Discovery",
      destination: "Tokyo, Japan",
      dates: "Jan 8 - Jan 15, 2025",
      status: "planning",
      image: "🇯🇵"
    }
  ];

  // Auto-advance images every 15 seconds
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Clean up expired images (older than 12 hours)
  useEffect(() => {
    const now = Date.now();
    const twelveHoursAgo = now - (12 * 60 * 60 * 1000);
    
    images.forEach(image => {
      if (image.addedAt < twelveHoursAgo) {
        onRemoveImage(image.id);
      }
    });
  }, [images, onRemoveImage]);

  const handleAddToTrip = (image: InstaTripImage) => {
    setSelectedImageForTrip(image);
    setIsAddToTripModalOpen(true);
  };

  const handleAddToExistingTrip = (tripId: number) => {
    if (selectedImageForTrip) {
      // Update the image to mark it as added to trip
      const trip = trips.find(t => t.id === tripId);
      if (trip) {
        toast({
          title: "Added to Trip!",
          description: `${selectedImageForTrip.location} has been added to ${trip.name}.`
        });
      }
    }
  };

  const handleCreateNewTripFromImage = () => {
    setIsAddToTripModalOpen(false);
    toast({
      title: "Create New Trip",
      description: "Opening trip creation form..."
    });
  };

  if (images.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-800">
              InstanTrip
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-8 text-center">
            <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No InstanTrip memories yet</p>
            <p className="text-sm text-gray-500">Add photos through the "Add Memory" button to start your InstanTrip!</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-gray-800">
            InstanTrip
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={image.id}>
                  <div className="relative">
                    <img
                      src={image.src}
                      alt={`InstanTrip memory ${index + 1}`}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-8 h-8 rounded-full p-0"
                        onClick={() => onRemoveImage(image.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Location and trip info overlay */}
                    <div className="absolute bottom-4 left-4 right-4 space-y-2">
                      {image.location && (
                        <div className="bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin size={16} />
                            <span className="text-sm font-medium">{image.location}</span>
                          </div>
                          
                          {/* Add to trip button */}
                          <div className="space-y-2">
                            {!image.tripId ? (
                              <Button
                                onClick={() => handleAddToTrip(image)}
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white"
                              >
                                <Plus size={12} className="mr-1" />
                                Add to Trip
                              </Button>
                            ) : (
                              <Badge variant="default" className="bg-blue-600 text-white">
                                Already in: {trips.find(t => t.id === image.tripId)?.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {image.text && (
                        <div className="bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm">
                          <p className="text-sm">{image.text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
          
          {images.length > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <AddToTripModal
          isOpen={isAddToTripModalOpen}
          onClose={() => {
            setIsAddToTripModalOpen(false);
            setSelectedImageForTrip(null);
          }}
          existingTrips={trips.filter(trip => trip.status !== 'completed')}
          onAddToExistingTrip={handleAddToExistingTrip}
          onCreateNewTrip={handleCreateNewTripFromImage}
          postLocation={selectedImageForTrip?.location}
        />
      </DialogContent>
    </Dialog>
  );
};

export default InstaTripModal;
