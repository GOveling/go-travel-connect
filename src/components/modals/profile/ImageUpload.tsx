
import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

const ImageUpload = ({ onFileSelect, isUploading }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex justify-center">
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
