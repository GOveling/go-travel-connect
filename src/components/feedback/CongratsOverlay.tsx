import React, { useEffect, useMemo, useState } from "react";
import Lottie from "lottie-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface CongratsOverlayProps {
  open: boolean;
  onClose?: () => void;
  message?: string;
}

// Small helper to respect reduced motion preferences
const useReducedMotion = () => {
  return useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
};

export const CongratsOverlay: React.FC<CongratsOverlayProps> = ({
  open,
  onClose,
  message = "¡Felicidades! Nuevo lugar agregado 👏",
}) => {
  const prefersReduced = useReducedMotion();
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    if (!open) return;

    // Load lottie JSON from public folder
    fetch("/lottie/logo-celebration.json")
      .then((r) => r.json())
      .then(setAnimationData)
      .catch(() => setAnimationData(null));

    // Fire confetti unless reduced motion
    if (!prefersReduced) {
      const duration = 1200;
      const end = Date.now() + duration;
      const colors = ["#7c3aed", "#6d28d9", "#f59e0b", "#10b981", "#ef4444"]; // use theme-adjacent colors

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
          ticks: 180,
          scalar: 0.9,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
          ticks: 180,
          scalar: 0.9,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }

    const t = setTimeout(() => onClose?.(), 1400);
    return () => clearTimeout(t);
  }, [open, onClose, prefersReduced]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-black/60 backdrop-blur-sm",
        "animate-fade-in"
      )}
    >
      <div
        className={cn(
          "relative w-[88vw] max-w-sm rounded-2xl",
          "bg-background text-foreground",
          "shadow-xl p-6 text-center"
        )}
      >
        <div className="w-40 h-40 mx-auto mb-3">
          {animationData ? (
            <Lottie animationData={animationData} loop={false} />
          ) : (
            <div className="w-full h-full rounded-full bg-primary/10" />
          )}
        </div>
        <p className="text-base font-semibold">{message}</p>
        <p className="text-sm text-muted-foreground mt-1">¡Buen viaje! ✈️</p>
      </div>
    </div>
  );
};

export default CongratsOverlay;
