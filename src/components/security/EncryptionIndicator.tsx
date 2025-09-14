// Security indicator component to show encryption status
import { Shield, ShieldCheck, ShieldAlert, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EncryptionIndicatorProps {
  isEncrypted: boolean;
  isOffline?: boolean;
  sensitivityLevel?: "low" | "medium" | "high" | "critical";
  className?: string;
}

export const EncryptionIndicator = ({
  isEncrypted,
  isOffline = false,
  sensitivityLevel = "medium",
  className
}: EncryptionIndicatorProps) => {
  const getSensitivityColor = () => {
    switch (sensitivityLevel) {
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTooltipText = () => {
    if (isEncrypted) {
      const mode = isOffline ? "offline con AES-256" : "online con RLS";
      return `Datos protegidos ${mode} - Nivel: ${sensitivityLevel}`;
    }
    return "Datos no encriptados";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 text-xs",
            isEncrypted ? getSensitivityColor() : "bg-yellow-100 text-yellow-800 border-yellow-300",
            className
          )}
        >
          {isEncrypted ? (
            <>
              <ShieldCheck className="h-3 w-3" />
              <span>Encriptado</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-3 w-3" />
              <span>Sin protección</span>
            </>
          )}
          
          {isOffline ? (
            <WifiOff className="h-3 w-3 ml-1" />
          ) : (
            <Wifi className="h-3 w-3 ml-1" />
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getTooltipText()}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default EncryptionIndicator;