import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
const AuthHeader = () => {
  const isMobile = useIsMobile();
  return <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-6 text-white text-center">
      <div className="flex justify-center mb-4">
        <img alt="GoVeling Logo" className="h-24 w-auto" src="/lovable-uploads/3b3be8b6-3e87-45c0-b4ba-839eff8dd92f.png" />
      </div>
      <p className="text-sm font-medium text-[#02d6fd]/90">GOveling - Travel Smart. Travel more</p>
    </div>;
};
export default AuthHeader;