
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface DangerZoneProps {
  onDelete: () => void;
}

const DangerZone = ({ onDelete }: DangerZoneProps) => {
  return (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2 text-red-700">
          <Trash2 className="text-red-600" size={20} />
          <span>Danger Zone</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-600 mb-3">
          Once you delete a trip, there is no going back. Please be certain.
        </p>
        <Button 
          variant="outline" 
          onClick={onDelete}
          className="w-full border-red-300 text-red-600 hover:bg-red-50"
        >
          <Trash2 size={16} className="mr-2" />
          Delete Trip
        </Button>
      </CardContent>
    </Card>
  );
};

export default DangerZone;
