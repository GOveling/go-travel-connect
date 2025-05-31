
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ModalHeaderProps {
  onClose: () => void;
}

const ModalHeader = ({ onClose }: ModalHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-orange-500 px-2 py-4 text-white">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute right-2 top-2 text-white hover:bg-white/20 h-8 w-8 z-10"
      >
        <X size={20} />
      </Button>
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <img 
            src="/lovable-uploads/852981bf-8475-4d98-8dc3-951465681587.png" 
            alt="GoVeling Logo" 
            className="object-contain"
            style={{ 
              maxWidth: isMobile ? '200px' : '250px',
              height: 'auto',
              transform: 'scale(2)',
              transformOrigin: 'center'
            }}
          />
        </div>
        <div className="relative overflow-hidden mt-4">
          <p className="text-white/90 text-base font-medium animate-fade-in">
            <span className="inline-block animate-pulse text-purple-100 font-bold text-lg">Travel Smart</span>
            <span className="text-white/80 mx-2 text-lg">•</span>
            <span className="inline-block animate-pulse text-orange-200 font-bold text-lg">Travel More</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalHeader;
