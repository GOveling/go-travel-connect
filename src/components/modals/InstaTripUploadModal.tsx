import { useState, useRef } from "react";
import { Camera, Upload, Image as ImageIcon, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import LocationSelector from "./LocationSelector";

interface InstaTripUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInstaTripImage: (imageSrc: string, text?: string, location?: string, tripId?: number) => void;
}

const InstaTripUploadModal = ({ isOpen, onClose, onAddInstaTripImage }: InstaTripUploadModalProps) => {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [tripId, setTripId] = useState<number | undefined>();
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const emojis = ["😀", "😍", "🎉", "❤️", "🔥", "✨", "🌟", "🚀", "🎈", "🌈", "☀️", "🌸", "🎊", "💫", "🎯", "🌺"];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive"
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
        video: { facingMode: 'environment' } 
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
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setSelectedImage(imageData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsUsingCamera(false);
  };

  const addEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
  };

  const handleLocationSelected = (selectedLocation: string, selectedTripId?: number) => {
    setLocation(selectedLocation);
    setTripId(selectedTripId);
  };

  const handlePost = () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image first",
        variant: "destructive"
      });
      return;
    }

    if (!location.trim()) {
      toast({
        title: "Error",
        description: "Please add a location for your photo",
        variant: "destructive"
      });
      return;
    }

    onAddInstaTripImage(selectedImage, text, location, tripId);
    toast({
      title: "Success",
      description: tripId ? "Posted to InstanTrip and added to trip!" : "Posted to InstanTrip!"
    });
    
    // Reset form
    setSelectedImage("");
    setText("");
    setLocation("");
    setTripId(undefined);
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    setSelectedImage("");
    setText("");
    setLocation("");
    setTripId(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-gray-800">
            Create InstanTrip Post
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 px-1">
          {!selectedImage && !isUsingCamera && (
            <div className="space-y-3">
              <Button
                onClick={startCamera}
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-3 border-2 border-blue-200 hover:bg-blue-50 text-blue-700"
              >
                <Camera size={20} />
                Take Photo
              </Button>
              
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-3 border-2 border-green-200 hover:bg-green-50 text-green-700"
              >
                <ImageIcon size={20} />
                Choose from Gallery
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
              
              <LocationSelector
                onLocationSelected={handleLocationSelected}
              />

              {location && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Add a caption:</label>
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Share your moment..."
                      className="min-h-[80px]"
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Add emojis:</label>
                      <div className="grid grid-cols-8 gap-1">
                        {emojis.map((emoji, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => addEmoji(emoji)}
                            className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handlePost} className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500">
                      <Send size={16} className="mr-2" />
                      Post to InstanTrip
                    </Button>
                    <Button 
                      onClick={() => setSelectedImage("")} 
                      variant="outline"
                      className="sm:w-auto"
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default InstaTripUploadModal;
