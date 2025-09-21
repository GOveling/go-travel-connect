import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useImageUpload = (onImageChange: (imageUrl: string) => void) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const compressAvatar = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      img.onload = () => {
        // Avatar optimized dimensions: 400x400px max
        const maxSize = 400;
        let { width, height } = img;

        // Calculate square crop dimensions (center crop)
        const size = Math.min(width, height);
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;

        // Scale down if necessary
        const scale = Math.min(maxSize / size, 1);
        const finalSize = Math.round(size * scale);

        canvas.width = finalSize;
        canvas.height = finalSize;

        // Draw cropped and scaled image
        ctx.drawImage(
          img,
          offsetX, offsetY, size, size,
          0, 0, finalSize, finalSize
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          0.85 // 85% quality for avatars
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    if (!user) {
      console.error("No user found");
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    try {
      console.log("Starting upload for user:", user.id);
      console.log("Uploading file:", fileName);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      console.log("Upload successful, public URL:", data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Compress the image before uploading
      const originalSize = (file.size / 1024).toFixed(1);
      const compressedFile = await compressAvatar(file);
      const compressedSize = (compressedFile.size / 1024).toFixed(1);
      
      console.log(`Avatar compressed: ${originalSize}KB → ${compressedSize}KB`);
      
      const imageUrl = await uploadImageToSupabase(compressedFile);

      if (imageUrl) {
        onImageChange(imageUrl);
        toast({
          title: "Éxito",
          description: `Avatar optimizado (${originalSize}KB → ${compressedSize}KB) y subido correctamente`,
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo subir la imagen",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleFileSelect:", error);
      toast({
        title: "Error",
        description: "Error al procesar la imagen",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    handleFileSelect,
  };
};
