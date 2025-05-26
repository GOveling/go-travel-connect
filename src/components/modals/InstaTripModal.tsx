
import { useState, useEffect } from "react";
import { X, Camera, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface InstaTripImage {
  id: string;
  src: string;
  addedAt: number;
}

interface InstaTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: InstaTripImage[];
  onRemoveImage: (id: string) => void;
}

const InstaTripModal = ({ isOpen, onClose, images, onRemoveImage }: InstaTripModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const formatTimeRemaining = (addedAt: number) => {
    const now = Date.now();
    const expiresAt = addedAt + (12 * 60 * 60 * 1000);
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return "Expired";
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m remaining`;
  };

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
                    <div className="absolute top-2 right-2 flex gap-2">
                      <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeRemaining(image.addedAt)}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-8 h-8 rounded-full p-0"
                        onClick={() => onRemoveImage(image.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
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
      </DialogContent>
    </Dialog>
  );
};

export default InstaTripModal;
