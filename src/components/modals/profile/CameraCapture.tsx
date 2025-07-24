import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
  isUploading: boolean;
}

const CameraCapture = ({
  onCapture,
  onCancel,
  isUploading,
}: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        canvasRef.current.toBlob(
          async (blob) => {
            if (blob) {
              const file = new File([blob], "camera-photo.jpg", {
                type: "image/jpeg",
              });
              onCapture(file);
            }
          },
          "image/jpeg",
          0.8
        );
      }
    }
  };

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
        <Button onClick={onCancel} variant="outline" disabled={isUploading}>
          <X size={16} className="mr-2" />
          Cancelar
        </Button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
