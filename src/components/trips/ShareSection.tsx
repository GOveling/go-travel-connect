
import { Share2, Link, Smartphone, ExternalLink, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const ShareSection = () => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
          <Share2 size={20} className="text-blue-600" />
          <span>{t("trips.share.title")}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-1 text-sm sm:text-base">{t("trips.share.subtitle")}</h4>
          <p className="text-xs sm:text-sm text-blue-600">Share the app with fellow travelers and discover amazing destinations together. Build your travel community!</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start text-xs sm:text-sm">
            <Link size={16} className="mr-2" />
            Copy App Link
          </Button>
          <Button variant="outline" className="justify-start text-xs sm:text-sm">
            <Smartphone size={16} className="mr-2" />
            Share via Mobile
          </Button>
          <Button variant="outline" className="justify-start text-xs sm:text-sm">
            <ExternalLink size={16} className="mr-2" />
            Social Media Share
          </Button>
          <Button variant="outline" className="justify-start text-xs sm:text-sm">
            <Users size={16} className="mr-2" />
            Invite via Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareSection;
