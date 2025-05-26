
import { useState, useRef } from "react";
import { Camera, Upload, Image as ImageIcon, Send, X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ProfilePublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPublication: (images: string[], text: string) => void;
}

const ProfilePublicationModal = ({ isOpen, onClose, onAddPublication }: ProfilePublicationModalProps) => {
  const { toast } = useToast();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const emojis = ["😀", "😍", "🎉", "❤️", "🔥", "✨", "🌟", "🚀", "🎈", "🌈", "☀️", "🌸", "🎊", "💫", "🎯", "🌺"];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedImages.length + files.length > 10) {
      toast({
        title: "Error",
        description: "You can only add up to 10 photos",
        variant: "destructive"
      });
      return;
    }

    files.forEach(file => {
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
          description: "Please upload image files only",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImages(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
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
    if (selectedImages.length >= 10) {
      toast({
        title: "Error",
        description: "You can only add up to 10 photos",
        variant: "destructive"
      });
      return;
    }

    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setSelectedImages(prev => [...prev, imageData]);
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

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const addEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
  };

  const handlePost = () => {
    if (selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one photo",
        variant: "destructive"
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please add some text to your post",
        variant: "destructive"
      });
      return;
    }

    onAddPublication(selectedImages, text);
    toast({
      title: "Success",
      description: "Published to your profile!"
    });
    
    // Reset form
    setSelectedImages([]);
    setText("");
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    setSelectedImages([]);
    setText("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-gray-800">
            Create Profile Publication
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isUsingCamera && (
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
                onClick={() => document.getElementById('file-upload-publication')?.click()}
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-3 border-2 border-green-200 hover:bg-green-50 text-green-700"
              >
                <ImageIcon size={20} />
                Choose from Gallery
              </Button>
              
              <input
                id="file-upload-publication"
                type="file"
                accept="image/*"
                multiple
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

          {selectedImages.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Photos ({selectedImages.length}/10):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Selected ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <Button
                        onClick={() => removeImage(index)}
                        size="sm"
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                  {selectedImages.length < 10 && (
                    <Button
                      onClick={() => document.getElementById('file-upload-publication')?.click()}
                      variant="outline"
                      className="h-20 border-2 border-dashed border-gray-300 hover:border-gray-400"
                    >
                      <Plus size={20} />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Caption:</label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Share your travel experience..."
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
              
              <Button onClick={handlePost} className="w-full bg-gradient-to-r from-purple-600 to-orange-500">
                <Send size={16} className="mr-2" />
                Publish to Profile
              </Button>
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePublicationModal;
