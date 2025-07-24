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
    <div className="relative bg-gradient-to-r from-purple-600 to-orange-500 px-2 py-6 text-white">
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute right-2 top-2 text-white hover:bg-white/20 h-8 w-8 z-10"
      >
        <X size={20} />
      </Button>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img
            src="/lovable-uploads/eb9957ef-488c-422e-a254-6758c709a828.png"
            alt="GoVeling Logo"
            className="object-contain"
            style={{
              width: isMobile ? "300px" : "400px",
              height: "auto",
            }}
          />
        </div>
        <div className="relative overflow-hidden mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mx-4">
            <p className="text-white font-bold text-lg tracking-wide">
              <span className="inline-block animate-pulse text-yellow-200 drop-shadow-lg text-xl font-extrabold">
                Travel Smart
              </span>
              <span className="text-white/90 mx-3 text-2xl font-bold">•</span>
              <span className="inline-block animate-pulse text-orange-200 drop-shadow-lg text-xl font-extrabold">
                Travel More
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalHeader;
