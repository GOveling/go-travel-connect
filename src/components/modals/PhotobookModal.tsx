
import { useState } from "react";
import { Image } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ImageUploadModal from "./ImageUploadModal";
import PhotoUploadSection from "./photobook/PhotoUploadSection";
import PhotoCarousel from "./photobook/PhotoCarousel";

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

  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);

  const handleImageAdded = (imageSrc: string) => {
    const newPhoto: PhotoItem = {
      id: Date.now().toString(),
      url: imageSrc,
      uploadedBy: "You",
      uploadedAt: "Just now",
      likes: 0
    };
    setPhotos(prev => [newPhoto, ...prev]);
    console.log("New photo uploaded");
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    console.log("Photo deleted:", photoId);
  };

  const handleDownloadPhoto = (photoUrl: string, photoId: string) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `trip-photo-${photoId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("Photo downloaded:", photoId);
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
            <PhotoUploadSection onAddImageClick={() => setIsImageUploadModalOpen(true)} />

            {/* Photo Carousel */}
            <PhotoCarousel
              photos={photos}
              onDeletePhoto={handleDeletePhoto}
              onDownloadPhoto={handleDownloadPhoto}
            />
          </div>

          {/* Close Button */}
          <div className="flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full">
              Close Photobook
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={() => setIsImageUploadModalOpen(false)}
        onImageAdded={handleImageAdded}
      />
    </>
  );
};

export default PhotobookModal;
