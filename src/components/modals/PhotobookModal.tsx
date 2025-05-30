
import { useState } from "react";
import { Camera, Upload, Image, X, Plus, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import InstaTripUploadModal from "./InstaTripUploadModal";

interface Trip {
  id: number;
  name: string;
  destination: string;
  dates: string;
  image: string;
  collaborators?: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: "owner" | "editor" | "viewer";
  }>;
}

interface PhotobookModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PhotoItem {
  id: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  likes: number;
}

const PhotobookModal = ({ trip, isOpen, onClose }: PhotobookModalProps) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80",
      uploadedBy: "You",
      uploadedAt: "2 hours ago",
      likes: 3
    },
    {
      id: "2", 
      url: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=800&q=80",
      uploadedBy: "Emma Wilson",
      uploadedAt: "5 hours ago", 
      likes: 7
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&w=800&q=80",
      uploadedBy: "David Brown",
      uploadedAt: "1 day ago",
      likes: 5
    }
  ]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleAddImage = (imageSrc: string) => {
    const newPhoto: PhotoItem = {
      id: Date.now().toString(),
      url: imageSrc,
      uploadedBy: "You",
      uploadedAt: "Just now",
      likes: 0
    };
    setPhotos(prev => [newPhoto, ...prev]);
    console.log("New photo added to photobook");
  };

  if (!trip) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <Image className="text-purple-600" size={24} />
              <span>{trip.name} - Digital Photobook</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4 p-1">
            {/* Upload Section */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-gray-800 mb-1">Add Your Memories</h3>
                    <p className="text-sm text-gray-600">Upload photos to create beautiful memories with your team</p>
                  </div>

                  <Button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Image
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Photo Carousel */}
            <div className="flex-1 overflow-hidden">
              <Card className="h-full">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Trip Album</h3>
                    <span className="text-sm text-gray-600">{photos.length} photos</span>
                  </div>

                  {photos.length > 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Carousel className="w-full max-w-4xl">
                        <CarouselContent>
                          {photos.map((photo) => (
                            <CarouselItem key={photo.id}>
                              <div className="space-y-4">
                                {/* Photo */}
                                <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                  <img
                                    src={photo.url}
                                    alt="Trip memory"
                                    className="max-w-full max-h-full object-contain transition-all duration-300"
                                  />
                                  
                                  {/* Photo overlay info */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <div className="flex items-center justify-between text-white">
                                      <div>
                                        <p className="font-medium">{photo.uploadedBy}</p>
                                        <p className="text-xs opacity-80">{photo.uploadedAt}</p>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Heart size={14} className="text-red-400" />
                                        <span className="text-sm">{photo.likes}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Camera className="text-gray-400" size={24} />
                        </div>
                        <div>
                          <p className="text-gray-600 mb-2">No photos yet</p>
                          <p className="text-sm text-gray-500">Start building your trip memories by adding the first photo!</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full">
              Close Photobook
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <InstaTripUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddInstaTripImage={(imageSrc) => {
          handleAddImage(imageSrc);
          setIsUploadModalOpen(false);
        }}
      />
    </>
  );
};

export default PhotobookModal;
