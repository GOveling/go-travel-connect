
import { Heart, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PhotoItemProps {
  photo: {
    id: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
    likes: number;
  };
  onDelete: (photoId: string) => void;
  onDownload: (photoUrl: string, photoId: string) => void;
}

const PhotoItem = ({ photo, onDelete, onDownload }: PhotoItemProps) => {
  return (
    <div className="space-y-4">
      {/* Photo */}
      <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center group">
        <img
          src={photo.url}
          alt="Trip memory"
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Photo Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 sm:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onDownload(photo.url, photo.id)}
            className="bg-white/90 hover:bg-white text-gray-700"
          >
            <Download size={16} />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="bg-red-500/90 hover:bg-red-600 text-white"
              >
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this photo? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(photo.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
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
  );
};

export default PhotoItem;
