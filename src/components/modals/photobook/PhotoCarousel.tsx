
import { Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import PhotoItem from "./PhotoItem";

interface PhotoItemType {
  id: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  likes: number;
}

interface PhotoCarouselProps {
  photos: PhotoItemType[];
  onDeletePhoto: (photoId: string) => void;
  onDownloadPhoto: (photoUrl: string, photoId: string) => void;
}

const PhotoCarousel = ({ photos, onDeletePhoto, onDownloadPhoto }: PhotoCarouselProps) => {
  return (
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
                      <PhotoItem
                        photo={photo}
                        onDelete={onDeletePhoto}
                        onDownload={onDownloadPhoto}
                      />
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
  );
};

export default PhotoCarousel;
