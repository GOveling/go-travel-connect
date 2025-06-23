
import React from "react";
import AvatarDisplay from "./AvatarDisplay";
import ImageUpload from "./ImageUpload";
import { useImageUpload } from "./useImageUpload";

interface ImageUploadSectionProps {
  currentAvatarUrl: string;
  onImageChange: (imageUrl: string) => void;
  initials: string;
}

const ImageUploadSection = ({ currentAvatarUrl, onImageChange, initials }: ImageUploadSectionProps) => {
  const {
    isUploading,
    handleFileSelect
  } = useImageUpload(onImageChange);

  return (
    <div className="flex flex-col items-center space-y-4">
      <AvatarDisplay 
        currentAvatarUrl={currentAvatarUrl}
        initials={initials}
      />
      
      <ImageUpload
        onFileSelect={handleFileSelect}
        isUploading={isUploading}
      />
      
      <p className="text-sm text-gray-500 text-center">
        Selecciona una imagen desde tu dispositivo
      </p>
    </div>
  );
};

export default ImageUploadSection;
