
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const RecentBookingsSection = () => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("booking.recentBookings.title")}</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-gray-500 mb-4">{t("booking.recentBookings.noBookings")}</p>
        <Button variant="outline" size="sm">
          {t("booking.recentBookings.viewAll")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentBookingsSection;
