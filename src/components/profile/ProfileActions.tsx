import { LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

interface ProfileActionsProps {
  onSignOut: () => void;
}

const ProfileActions = ({ onSignOut }: ProfileActionsProps) => {
  const { t } = useLanguage();

  return (
    <Card className="border-red-200">
      <CardContent className="p-4">
        <Button
          variant="ghost"
          className="w-full text-red-600 hover:bg-red-50"
          onClick={onSignOut}
        >
          <LogOut size={20} className="mr-2" />
          {t("profile.signOut")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileActions;
