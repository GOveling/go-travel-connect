
import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadSectionProps {
  currentAvatarUrl: string;
  onImageChange: (imageUrl: string) => void;
  initials: string;
}

const ImageUploadSection = ({ currentAvatarUrl, onImageChange, initials }: ImageUploadSectionProps) => {
  const { toast } = useToast();
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo debe ser menor a 5MB",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onImageChange(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsUsingCamera(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara",
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
        
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onImageChange(imageData);
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

  if (isUsingCamera) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-64 h-64 rounded-xl overflow-hidden bg-gray-200">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex space-x-3">
          <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
            <Camera size={16} className="mr-2" />
            Capturar
          </Button>
          <Button onClick={stopCamera} variant="outline">
            <X size={16} className="mr-2" />
            Cancelar
          </Button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          {currentAvatarUrl ? (
            <AvatarImage src={currentAvatarUrl} alt="Profile" />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-orange-500 text-white text-2xl font-bold">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className="flex space-x-3">
        <Button
          onClick={startCamera}
          variant="outline"
          className="flex items-center space-x-2 border-2 border-blue-200 hover:bg-blue-50 text-blue-700"
        >
          <Camera size={16} />
          <span>Cámara</span>
        </Button>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="flex items-center space-x-2 border-2 border-green-200 hover:bg-green-50 text-green-700"
        >
          <Upload size={16} />
          <span>Dispositivo</span>
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <p className="text-sm text-gray-500 text-center">
        Toma una foto o selecciona desde tu dispositivo
      </p>
    </div>
  );
};

export default ImageUploadSection;
