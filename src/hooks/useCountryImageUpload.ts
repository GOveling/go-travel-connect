import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCountryImageUpload = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const uploadCountryImage = async (countryName: string, imageFile: File) => {
    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });

      const imageData = await base64Promise;
      const fileName = `${countryName.toLowerCase().replace(/\s+/g, "-")}.${imageFile.name.split(".").pop()}`;

      // Call edge function
      const { data, error } = await supabase.functions.invoke(
        "upload-country-image",
        {
          body: {
            countryName,
            imageData,
            fileName,
          },
        }
      );

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Imagen subida exitosamente",
          description: `La imagen de ${countryName} se ha actualizado correctamente.`,
        });
        return data.imageUrl;
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error uploading country image:", error);
      toast({
        title: "Error al subir imagen",
        description: "No se pudo subir la imagen del país. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadCountryImage,
    loading,
  };
};
