
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SpecialOfferCard = () => {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-6 text-white">
        <h3 className="text-xl font-bold mb-2">✨ Special Offer!</h3>
        <p className="text-sm opacity-90 mb-3">
          Get 20% off on your first hotel booking with code WELCOME20
        </p>
        <Button variant="secondary" size="sm">
          Claim Offer
        </Button>
      </div>
    </Card>
  );
};

export default SpecialOfferCard;
