
import { Plus, MapPin, FileText, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onCreateTrip: () => void;
  onExplore: () => void;
  onTravelDocuments: () => void;
  onAIAssistant: () => void;
}

const QuickActions = ({
  onCreateTrip,
  onExplore,
  onTravelDocuments,
  onAIAssistant
}: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onCreateTrip}
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
          >
            <Plus size={20} />
            <span className="text-xs">New Trip</span>
          </Button>

          <Button
            onClick={onExplore}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1"
          >
            <MapPin size={20} />
            <span className="text-xs">Explore</span>
          </Button>

          <Button
            onClick={onTravelDocuments}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1"
          >
            <FileText size={20} />
            <span className="text-xs">Documents</span>
          </Button>

          <Button
            onClick={onAIAssistant}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1"
          >
            <Bot size={20} />
            <span className="text-xs">AI Assistant</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
