
import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ImageUploadSectionProps {
  currentAvatarUrl: string;
  onImageChange: (imageUrl: string) => void;
  initials: string;
}

const ImageUploadSection = ({ currentAvatarUrl, onImageChange, initials }: ImageUploadSectionProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploading(true);
    const imageUrl = await uploadImageToSupabase(file);
    
    if (imageUrl) {
      onImageChange(imageUrl);
      toast({
        title: "Éxito",
        description: "Imagen subida correctamente",
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive"
      });
    }
    setIsUploading(false);
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

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            setIsUploading(true);
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
            const imageUrl = await uploadImageToSupabase(file);
            
            if (imageUrl) {
              onImageChange(imageUrl);
              toast({
                title: "Éxito",
                description: "Foto capturada y guardada correctamente",
              });
            } else {
              toast({
                title: "Error",
                description: "No se pudo guardar la foto",
                variant: "destructive"
              });
            }
            setIsUploading(false);
          }
        }, 'image/jpeg', 0.8);
        
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
          <Button 
            onClick={capturePhoto} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isUploading}
          >
            <Camera size={16} className="mr-2" />
            {isUploading ? "Guardando..." : "Capturar"}
          </Button>
          <Button onClick={stopCamera} variant="outline" disabled={isUploading}>
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
          disabled={isUploading}
        >
          <Camera size={16} />
          <span>Cámara</span>
        </Button>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="flex items-center space-x-2 border-2 border-green-200 hover:bg-green-50 text-green-700"
          disabled={isUploading}
        >
          <Upload size={16} />
          <span>{isUploading ? "Subiendo..." : "Dispositivo"}</span>
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
