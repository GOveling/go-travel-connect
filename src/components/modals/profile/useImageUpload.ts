
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useImageUpload = (onImageChange: (imageUrl: string) => void) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    if (!user) {
      console.error('No user found');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    try {
      console.log('Starting upload for user:', user.id);
      console.log('Uploading file:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Upload successful, public URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleFileSelect = async (file: File) => {
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
    try {
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
    } catch (error) {
      console.error('Error in handleFileSelect:', error);
      toast({
        title: "Error",
        description: "Error al procesar la imagen",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
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
      console.error('Camera error:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara",
        variant: "destructive"
      });
    }
  };

  const handleCameraCapture = async (file: File) => {
    setIsUploading(true);
    try {
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
    } catch (error) {
      console.error('Error in handleCameraCapture:', error);
      toast({
        title: "Error",
        description: "Error al procesar la foto",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsUsingCamera(false);
  };

  return {
    isUploading,
    isUsingCamera,
    videoRef,
    handleFileSelect,
    startCamera,
    handleCameraCapture,
    stopCamera
  };
};
