import React from "react";
import { cn } from "@/lib/utils";
import { ButtonColorful } from "@/components/ui/button-colorful";
import { useLanguage } from "@/hooks/useLanguage";
interface ExploreHeroProps {
  title?: string;
  subtitle?: string;
  onExploreClick?: () => void;
}

/**
 * Hero móvil con el logo animado y texto inspirador.
 * Usa el logo adjunto como elemento principal.
 */
export const ExploreHero: React.FC<ExploreHeroProps> = ({
  title,
  subtitle,
  onExploreClick
}) => {
  const { t } = useLanguage();
  return <header className="relative overflow-hidden rounded-2xl">
      <div className={cn("relative z-10 p-5", "bg-gradient-to-br from-primary/10 via-transparent to-secondary/10")}>
        <h1 className="text-xl font-bold leading-tight">
          {title || t("explore.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 px-0">{subtitle || t("explore.subtitle")}</p>
        <div className="mt-3">
          <ButtonColorful label={t("explore.nearbyPlaces.exploreNow")} onClick={onExploreClick} />
        </div>
      </div>

      {/* Logo flotando */}
      <div className="absolute -right-4 -bottom-2 w-36 h-36 select-none no-native-drag">
        <img src="/lovable-uploads/02afc911-6c35-4d2c-8105-91706c453843.png" alt="Logo dirigible — héroe" className="w-full h-full object-contain pointer-events-none animate-[float_6s_ease-in-out_infinite]" draggable={false} onDragStart={e => e.preventDefault()} />
      </div>
    </header>;
};
export default ExploreHero;