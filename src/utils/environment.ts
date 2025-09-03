/**
 * Utility to detect environment and provide correct URLs
 */

export type Environment =
  | "development"
  | "production"
  | "lovable"
  | "capacitor";

export const detectEnvironment = (): Environment => {
  // Detectar si estamos en Capacitor
  if (typeof window !== "undefined" && (window as any).Capacitor) {
    return "capacitor";
  }

  const hostname = window.location.hostname;
  const isDev = import.meta.env.DEV;

  if (isDev || hostname === "localhost" || hostname === "127.0.0.1") {
    return "development";
  }

  if (hostname.includes("lovableproject.com")) {
    return "lovable";
  }

  return "production";
};

export const getBaseUrl = (): string => {
  const env = detectEnvironment();

  if (env === "capacitor") {
    return "https://bc24aefb-3820-4bdb-bbd4-aa7d5ea01cf8.lovableproject.com";
  }

  return window.location.origin;
};

export const getRedirectUrl = (path: string = ""): string => {
  const env = detectEnvironment();

  if (env === "capacitor") {
    return `app.lovable.bc24aefb38204bdbbbd4aa7d5ea01cf8://callback${path}`;
  }

  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
};

export const getEnvironmentConfig = () => {
  const env = detectEnvironment();
  const baseUrl = getBaseUrl();

  console.log(`🌍 Environment detected: ${env}`);
  console.log(`🔗 Base URL: ${baseUrl}`);

  return {
    environment: env,
    baseUrl,
    isDevelopment: env === "development",
    isProduction: env === "production",
    isLovable: env === "lovable",
    isCapacitor: env === "capacitor",
  };
};
