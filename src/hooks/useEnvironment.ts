import { useEffect, useState } from "react";

/**
 * Hook para detectar el entorno de ejecución
 * Útil para aplicar configuraciones específicas en Vercel vs Lovable
 */
export const useEnvironment = () => {
  const [environment, setEnvironment] = useState<
    "development" | "production" | "unknown"
  >("unknown");
  const [isVercel, setIsVercel] = useState(false);
  const [isLovable, setIsLovable] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Detectar si estamos en el cliente
    setIsClient(typeof window !== "undefined");

    if (typeof window !== "undefined") {
      // Detectar el entorno basado en la URL
      const hostname = window.location.hostname;

      // Detectar Vercel
      if (
        hostname.includes(".vercel.app") ||
        hostname.includes(".vercel.com")
      ) {
        setIsVercel(true);
        setEnvironment("production");
      }
      // Detectar Lovable
      else if (hostname.includes(".lovableproject.com")) {
        setIsLovable(true);
        setEnvironment("development");
      }
      // Detectar localhost
      else if (hostname === "localhost" || hostname === "127.0.0.1") {
        setEnvironment("development");
      }
      // Otros dominios de producción
      else {
        setEnvironment("production");
      }

      console.log("🌍 Environment detected:", {
        hostname,
        environment: environment,
        isVercel,
        isLovable,
        isClient: true,
      });
    }
  }, []);

  return {
    environment,
    isVercel,
    isLovable,
    isClient,
    isDevelopment: environment === "development",
    isProduction: environment === "production",
  };
};
