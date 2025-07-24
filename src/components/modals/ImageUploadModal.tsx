import { useState, useRef } from "react";
import { Camera, Upload, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageAdded: (imageSrc: string) => void;
}

const ImageUploadModal = ({
  isOpen,
  onClose,
  onImageAdded,
}: ImageUploadModalProps) => {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsUsingCamera(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access camera",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setSelectedImage(imageData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsUsingCamera(false);
  };

  const handleAddImage = () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    onImageAdded(selectedImage);
    toast({
      title: "Success",
      description: "Photo added to your photobook!",
    });

    handleClose();
  };

  const handleClose = () => {
    stopCamera();
    setSelectedImage("");
    setIsUsingCamera(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-gray-800">
            Add Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-1">
          {!selectedImage && !isUsingCamera && (
            <div className="space-y-3">
              <Button
                onClick={startCamera}
                variant="outline"
                className="w-full h-16 flex items-center justify-center gap-3 border-2 border-blue-200 hover:bg-blue-50 text-blue-700"
              >
                <Camera size={24} />
                <span className="text-lg">Take Photo</span>
              </Button>

              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                variant="outline"
                className="w-full h-16 flex items-center justify-center gap-3 border-2 border-green-200 hover:bg-green-50 text-green-700"
              >
                <Upload size={24} />
                <span className="text-lg">Upload from Device</span>
              </Button>

              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {isUsingCamera && (
            <div className="space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover rounded-lg bg-gray-200"
              />
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera size={16} className="mr-2" />
                  Capture
                </Button>
                <Button onClick={stopCamera} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-64 object-cover rounded-lg"
              />

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleAddImage}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500"
                >
                  <ImageIcon size={16} className="mr-2" />
                  Add to Photobook
                </Button>
                <Button
                  onClick={() => setSelectedImage("")}
                  variant="outline"
                  className="sm:w-auto"
                >
                  Choose Different Photo
                </Button>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
