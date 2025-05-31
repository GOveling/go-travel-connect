
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
    <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-orange-500 px-4 py-8 text-white overflow-hidden">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute right-3 top-3 text-white hover:bg-white/20 h-10 w-10 z-20 rounded-full transition-all duration-300 interactive"
      >
        <X size={20} />
      </Button>

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          <defs>
            <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="60" fill="url(#bgGradient)">
            <animate attributeName="r" values="60;80;60" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="300" cy="200" r="40" fill="url(#bgGradient)">
            <animate attributeName="r" values="40;60;40" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="250" r="30" fill="url(#bgGradient)">
            <animate attributeName="r" values="30;50;30" dur="5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <div className="text-center relative z-10">
        {/* Logo container with enhanced effects */}
        <div className="flex justify-center mb-6 relative">
          <div className="relative group">
            <img 
              src="/lovable-uploads/eb9957ef-488c-422e-a254-6758c709a828.png" 
              alt="GoVeling Logo" 
              className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
              style={{ 
                width: isMobile ? '300px' : '400px',
                height: 'auto'
              }}
            />
            {/* Glowing effect behind logo */}
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-2xl opacity-50 animate-pulse"></div>
          </div>
        </div>

        {/* Enhanced tagline with glass morphism */}
        <div className="relative overflow-hidden mt-8">
          <div className="glass backdrop-blur-md rounded-full px-8 py-4 mx-4 border border-white/30 shadow-modern">
            <p className="text-white font-bold text-lg tracking-wide relative z-10">
              <span className="inline-block animate-fade-in-up text-yellow-200 drop-shadow-lg text-xl font-extrabold mr-2">
                Travel Smart
              </span>
              <span className="text-white/90 mx-3 text-2xl font-bold animate-pulse">•</span>
              <span className="inline-block animate-fade-in-up text-orange-200 drop-shadow-lg text-xl font-extrabold ml-2">
                Travel More
              </span>
            </p>
            
            {/* Animated underline */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full">
              <div className="w-full h-full bg-white/50 rounded-full animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
        <div className="absolute top-12 right-8 w-1 h-1 bg-yellow-200/50 rounded-full animate-bounce"></div>
        <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-orange-200/40 rounded-full animate-pulse"></div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg viewBox="0 0 400 40" className="w-full h-10">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M0,40 Q100,20 200,30 T400,25 L400,40 Z" fill="url(#waveGradient)">
            <animate attributeName="d" 
              values="M0,40 Q100,20 200,30 T400,25 L400,40 Z;M0,40 Q100,30 200,20 T400,35 L400,40 Z;M0,40 Q100,20 200,30 T400,25 L400,40 Z" 
              dur="8s" 
              repeatCount="indefinite" />
          </path>
        </svg>
      </div>
    </div>
  );
};

export default ModalHeader;
