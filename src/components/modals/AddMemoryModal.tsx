
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-800">
              Add Memory
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Button
              onClick={handleInstanTrip}
              variant="outline"
              className="w-full h-16 flex items-center justify-start gap-4 text-left border-2 border-purple-200 hover:bg-purple-50 text-purple-700 p-4"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Upload size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Add InstanTrip</p>
                <p className="text-sm text-gray-500">Upload a photo with location for your InstanTrip story</p>
              </div>
            </Button>

            <Button
              onClick={handleCreatePublication}
              variant="outline"
              className="w-full h-16 flex items-center justify-start gap-4 text-left border-2 border-orange-200 hover:bg-orange-50 text-orange-700 p-4"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Share size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Create Publication</p>
                <p className="text-sm text-gray-500">Share to your feed profile with location</p>
              </div>
            </Button>

            <Button
              onClick={handleAddImage}
              variant="outline"
              className="w-full h-16 flex items-center justify-start gap-4 text-left border-2 border-blue-200 hover:bg-blue-50 text-blue-700 p-4"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Camera size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Add Image</p>
                <p className="text-sm text-gray-500">Add photo with location to saved places</p>
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
