
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const AuthHeader = () => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-6 text-white text-center">
      <div className="flex justify-center mb-4">
        <img 
          src="/lovable-uploads/2e7d8d8c-8611-4e84-84a8-467fc6bcbdc7.png" 
          alt="GoVeling Logo" 
          className="h-24 w-auto"
        />
      </div>
      <p className="text-white/90 text-sm font-medium">
        Travel Smart. Travel more
      </p>
    </div>
  );
};

export default AuthHeader;
