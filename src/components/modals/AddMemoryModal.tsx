
import { Camera, MapPin, Share, Plus, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import InstaTripUploadModal from "./InstaTripUploadModal";

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInstaTripImage?: (image: string, text?: string, location?: string, tripId?: number) => void;
  onCreatePublication?: () => void;
}

const AddMemoryModal = ({ isOpen, onClose, onAddInstaTripImage, onCreatePublication }: AddMemoryModalProps) => {
  const [isInstaTripUploadOpen, setIsInstaTripUploadOpen] = useState(false);

  const handleInstanTrip = () => {
    setIsInstaTripUploadOpen(true);
  };

  const handleCreatePublication = () => {
    onCreatePublication?.();
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
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[85vw] max-w-[350px] max-h-[85vh] overflow-y-auto p-4 border rounded-lg bg-white shadow-lg">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-center text-base font-semibold text-gray-800">
              Add Memory
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 pb-4">
            <Button
              onClick={handleInstanTrip}
              variant="outline"
              className="w-full h-auto flex items-center justify-start gap-3 text-left border-2 border-purple-200 hover:bg-purple-50 text-purple-700 p-3 min-h-[60px]"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Upload size={16} className="text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">Add InstanTrip</p>
                <p className="text-xs text-gray-500 break-words">Show your Trip in real time</p>
              </div>
            </Button>

            <Button
              onClick={handleCreatePublication}
              variant="outline"
              className="w-full h-auto flex items-center justify-start gap-3 text-left border-2 border-orange-200 hover:bg-orange-50 text-orange-700 p-3 min-h-[60px]"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Share size={16} className="text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">Create Publication</p>
                <p className="text-xs text-gray-500 break-words">Share the best part of your travels</p>
              </div>
            </Button>

            <Button
              onClick={handleAddImage}
              variant="outline"
              className="w-full h-auto flex items-center justify-start gap-3 text-left border-2 border-blue-200 hover:bg-blue-50 text-blue-700 p-3 min-h-[60px]"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Camera size={16} className="text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">Add Image</p>
                <p className="text-xs text-gray-500 break-words">Add photo in your Places Photobook</p>
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
