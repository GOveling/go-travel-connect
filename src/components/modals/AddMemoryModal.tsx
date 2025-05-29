
import { Camera, MapPin, Share, Plus, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import InstaTripUploadModal from "./InstaTripUploadModal";

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInstaTripImage?: (image: string, text?: string, location?: string, tripId?: number) => void;
}

const AddMemoryModal = ({ isOpen, onClose, onAddInstaTripImage }: AddMemoryModalProps) => {
  const [isInstaTripUploadOpen, setIsInstaTripUploadOpen] = useState(false);

  const handleInstanTrip = () => {
    setIsInstaTripUploadOpen(true);
  };

  const handleCreatePublication = () => {
    console.log("Create publication clicked");
    // TODO: Implement publication creation functionality
    onClose();
  };

  const handleAddImage = () => {
    console.log("Add image to saved places clicked");
    // TODO: Implement add image functionality
    onClose();
  };

  const handleInstaTripUpload = (imageSrc: string, text?: string, location?: string, tripId?: number) => {
    onAddInstaTripImage?.(imageSrc, text, location, tripId);
    setIsInstaTripUploadOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[90vw] max-w-sm mx-auto max-h-[85vh] overflow-y-auto p-4 sm:p-6 m-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center text-lg sm:text-xl font-semibold text-gray-800">
              Add Memory
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 py-2">
            <Button
              onClick={handleInstanTrip}
              variant="outline"
              className="w-full h-auto flex items-center justify-start gap-3 text-left border-2 border-purple-200 hover:bg-purple-50 text-purple-700 p-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Upload size={16} className="sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">Add InstanTrip</p>
                <p className="text-xs sm:text-sm text-gray-500 break-words">Upload a photo with location for your InstanTrip story</p>
              </div>
            </Button>

            <Button
              onClick={handleCreatePublication}
              variant="outline"
              className="w-full h-auto flex items-center justify-start gap-3 text-left border-2 border-orange-200 hover:bg-orange-50 text-orange-700 p-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Share size={16} className="sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">Create Publication</p>
                <p className="text-xs sm:text-sm text-gray-500 break-words">Share to your feed profile with location</p>
              </div>
            </Button>

            <Button
              onClick={handleAddImage}
              variant="outline"
              className="w-full h-auto flex items-center justify-start gap-3 text-left border-2 border-blue-200 hover:bg-blue-50 text-blue-700 p-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Camera size={16} className="sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">Add Image</p>
                <p className="text-xs sm:text-sm text-gray-500 break-words">Add photo with location to saved places</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <InstaTripUploadModal
        isOpen={isInstaTripUploadOpen}
        onClose={() => setIsInstaTripUploadOpen(false)}
        onAddInstaTripImage={handleInstaTripUpload}
      />
    </>
  );
};

export default AddMemoryModal;
