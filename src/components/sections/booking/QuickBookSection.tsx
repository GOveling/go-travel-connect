
import { Plane, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuickBookSectionProps {
  onFlightClick: () => void;
  onHotelClick: () => void;
}

const QuickBookSection = ({ onFlightClick, onHotelClick }: QuickBookSectionProps) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("booking.quickBook.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-left justify-start"
          onClick={onFlightClick}
        >
          <Plane className="mr-3" size={20} />
          <div>
            <p className="font-medium">{t("booking.quickBook.roundTrip")}</p>
            <p className="text-xs opacity-90">{t("booking.quickBook.from")} $299</p>
          </div>
        </Button>
        <Button 
          variant="outline" 
          className="w-full h-14 text-left justify-start border-2"
          onClick={onHotelClick}
        >
          <Building className="mr-3" size={20} />
          <div>
            <p className="font-medium">{t("booking.quickBook.hotelPackage")}</p>
            <p className="text-xs text-gray-600">{t("booking.quickBook.saveUpTo")}</p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickBookSection;
