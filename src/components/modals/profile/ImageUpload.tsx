
import { useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  onCameraStart: () => void;
  isUploading: boolean;
}

const ImageUpload = ({ onFileSelect, onCameraStart, isUploading }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex space-x-3">
      <Button
        onClick={onCameraStart}
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
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
