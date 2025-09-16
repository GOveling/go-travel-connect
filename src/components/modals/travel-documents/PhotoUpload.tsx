import { useState } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  photo: string;
  onPhotoChange: (photo: string) => void;
}

const PhotoUpload = ({ photo, onPhotoChange }: PhotoUploadProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const { toast } = useToast();

  // Compress image to reduce size before upload
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with quality compression (0.8 = 80% quality)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        // Extract only the base64 part (remove "data:image/jpeg;base64," prefix)
        const base64 = dataUrl.split(',')[1];
        
        // Check final size (target: under 2MB)
        const sizeInBytes = (base64.length * 3) / 4;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        console.log(`Image compressed: ${img.width}x${img.height} -> ${width}x${height}, ${sizeInMB.toFixed(2)}MB`);
        
        if (sizeInMB > 2) {
          // If still too large, reduce quality further
          const reducedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          const reducedBase64 = reducedDataUrl.split(',')[1];
          resolve(reducedBase64);
        } else {
          resolve(base64);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type first
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setIsCompressing(true);

    try {
      // Compress image automatically
      const compressedBase64 = await compressImage(file);
      
      // Check final size after compression
      const finalSizeInBytes = (compressedBase64.length * 3) / 4;
      const finalSizeInMB = finalSizeInBytes / (1024 * 1024);
      
      if (finalSizeInMB > 2) {
        toast({
          title: "Error",
          description: "Image is too large even after compression. Please try a smaller image.",
          variant: "destructive",
        });
        return;
      }

      // Store as data URL for preview but send only base64 to server
      const dataUrlForPreview = `data:image/jpeg;base64,${compressedBase64}`;
      onPhotoChange(dataUrlForPreview);
      
      const originalSizeInMB = file.size / (1024 * 1024);
      const compressionMessage = originalSizeInMB > 2 
        ? ` (compressed from ${originalSizeInMB.toFixed(1)}MB to ${finalSizeInMB.toFixed(1)}MB)`
        : '';
      
      toast({
        title: "Success",
        description: `Photo uploaded successfully${compressionMessage}`,
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const removePhoto = () => {
    onPhotoChange("");
  };

  return (
    <div>
      <Label htmlFor="photo">Document Photo</Label>
      <div className="mt-2">
        {photo ? (
          <div className="relative">
            <img
              src={photo}
              alt="Document preview"
              className="w-32 h-32 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
              onClick={removePhoto}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Upload a photo of your document
            </p>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("photo")?.click()}
              className="flex items-center space-x-2"
              disabled={isCompressing}
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compressing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo</span>
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Images are automatically compressed to optimize storage
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
