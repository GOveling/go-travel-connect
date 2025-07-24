import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SpecialOfferCard = () => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Star size={16} className="text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Special Offer
          </span>
        </div>
        <p className="text-xs text-green-700">
          Book now and get 15% off your first hotel booking!
        </p>
      </CardContent>
    </Card>
  );
};

export default SpecialOfferCard;
