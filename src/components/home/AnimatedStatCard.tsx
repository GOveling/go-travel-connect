import { useEffect, useMemo, useState } from "react";
import Lottie from "lottie-react";
import { Card, CardContent } from "@/components/ui/card";

interface AnimatedStatCardProps {
  value: number;
  label: string;
  animationUrl: string; // Path to a Lottie JSON in public or a full URL
  className?: string;
}

const AnimatedStatCard = ({ value, label, animationUrl, className = "" }: AnimatedStatCardProps) => {
  const [animationData, setAnimationData] = useState<any | null>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        const res = await fetch(animationUrl, { signal: controller.signal });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setAnimationData(json);
      } catch (_) {
        // Ignore fetch errors (offline, aborted, etc.)
      }
    };

    if (!prefersReducedMotion && animationUrl) load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [animationUrl, prefersReducedMotion]);

  return (
    <Card className={`relative overflow-hidden border-0 ${className}`} aria-label={`${label}: ${value}`}> 
      {/* Animated background */}
      {!prefersReducedMotion && animationData && (
        <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-80 w-28 h-28 sm:w-32 sm:h-32" aria-hidden>
          <Lottie animationData={animationData} loop autoplay />
        </div>
      )}

      <CardContent className="p-4 text-center relative z-10">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm opacity-90">{label}</p>
      </CardContent>
    </Card>
  );
};

export default AnimatedStatCard;
