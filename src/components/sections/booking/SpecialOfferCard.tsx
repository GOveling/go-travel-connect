
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTripImageGeneration } from "@/hooks/useTripImageGeneration";
import { useEffect, useState } from "react";

const SpecialOfferCard = () => {
  const { t } = useLanguage();
  const { generateTripImage, getTripImage, isGenerating } = useTripImageGeneration();
  const [offerImage, setOfferImage] = useState<string | null>(null);
  
  const destination = "Paradise Beach Resort";
  
  useEffect(() => {
    const cachedImage = getTripImage(destination);
    if (cachedImage) {
      setOfferImage(cachedImage);
    } else {
      generateTripImage(destination, "Special Beach Vacation Offer").then(imageUrl => {
        if (imageUrl) {
          setOfferImage(imageUrl);
        }
      });
    }
  }, [generateTripImage, getTripImage]);
  
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {offerImage && (
        <div className="h-32 overflow-hidden">
          <img 
            src={offerImage} 
            alt="Special Offer Destination"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">✨ {t("booking.specialOffer.title")}</h3>
        <p className="text-sm opacity-90 mb-3">
          {t("booking.specialOffer.subtitle")}
        </p>
        <Button variant="secondary" size="sm">
          {isGenerating(destination) ? "Loading..." : t("booking.specialOffer.bookNow")}
        </Button>
      </div>
    </Card>
  );
};

export default SpecialOfferCard;
