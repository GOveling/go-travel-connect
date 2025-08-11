import React from "react";
import { cn } from "@/lib/utils";

interface BottomSafeAdSlotProps {
  height?: number; // in px
  label?: string;
}

/**
 * Placeholder de anuncios amigable para móvil.
 * Fijo al fondo, respeta el safe-area en iOS y puede desactivarse si no se usa.
 */
export const BottomSafeAdSlot: React.FC<BottomSafeAdSlotProps> = ({
  height = 72,
  label = "Ad placeholder",
}) => {
  const style: React.CSSProperties = {
    height,
    paddingBottom: "env(safe-area-inset-bottom)",
  };

  return (
    <aside
      aria-label="Publicidad"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "border-t",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
      style={style}
    >
      <div className="h-full max-w-screen-sm mx-auto flex items-center justify-center px-4">
        <div
          className={cn(
            "w-full h-[52px] rounded-xl border-2 border-dashed",
            "flex items-center justify-center",
            "text-xs text-muted-foreground"
          )}
        >
          {label} · 320x50 / 320x100 (ejemplo)
        </div>
      </div>
    </aside>
  );
};

export default BottomSafeAdSlot;
