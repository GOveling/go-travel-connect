import { Capacitor } from "@capacitor/core";

export const isNative = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();
export const isIOS = () => Capacitor.getPlatform() === "ios";
export const isAndroid = () => Capacitor.getPlatform() === "android";

export const getCapacitorConfig = () => ({
  isNative: isNative(),
  platform: getPlatform(),
  isIOS: isIOS(),
  isAndroid: isAndroid(),
});

// Configuración de URLs específica para Capacitor
export const getCapacitorUrls = () => {
  if (isNative()) {
    return {
      baseUrl:
        "https://bc24aefb-3820-4bdb-bbd4-aa7d5ea01cf8.lovableproject.com",
      redirectUrl: "app.lovable.bc24aefb38204bdbbbd4aa7d5ea01cf8://callback",
    };
  }

  return {
    baseUrl: window.location.origin,
    redirectUrl: `${window.location.origin}/`,
  };
};
