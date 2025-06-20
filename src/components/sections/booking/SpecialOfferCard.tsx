
import GlassCard from "@/components/ui/glass-card";
import GradientButton from "@/components/ui/gradient-button";
import { useLanguage } from "@/contexts/LanguageContext";

const SpecialOfferCard = () => {
  const { t } = useLanguage();
  
  return (
    <GlassCard className="overflow-hidden border-0 shadow-lg">
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">✨ {t("booking.specialOffer.title")}</h3>
        <p className="text-sm opacity-90 mb-3">
          {t("booking.specialOffer.subtitle")}
        </p>
        <GradientButton variant="secondary" size="sm">
          {t("booking.specialOffer.bookNow")}
        </GradientButton>
      </div>
    </GlassCard>
  );
};

export default SpecialOfferCard;
