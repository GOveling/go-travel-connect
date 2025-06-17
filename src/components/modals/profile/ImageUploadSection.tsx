
import React from "react";
import AvatarDisplay from "./AvatarDisplay";
import ImageUpload from "./ImageUpload";
import CameraCapture from "./CameraCapture";
import { useImageUpload } from "./useImageUpload";

interface ImageUploadSectionProps {
  currentAvatarUrl: string;
  onImageChange: (imageUrl: string) => void;
  initials: string;
}

const ImageUploadSection = ({ currentAvatarUrl, onImageChange, initials }: ImageUploadSectionProps) => {
  const {
    isUploading,
    isUsingCamera,
    videoRef,
    handleFileSelect,
    startCamera,
    handleCameraCapture,
    stopCamera
  } = useImageUpload(onImageChange);

  if (isUsingCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onCancel={stopCamera}
        isUploading={isUploading}
      />
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <AvatarDisplay 
        currentAvatarUrl={currentAvatarUrl}
        initials={initials}
      />
      
      <ImageUpload
        onFileSelect={handleFileSelect}
        onCameraStart={startCamera}
        isUploading={isUploading}
      />
      
      <p className="text-sm text-gray-500 text-center">
        Toma una foto o selecciona desde tu dispositivo
      </p>
    </div>
  );
};

export default ImageUploadSection;
