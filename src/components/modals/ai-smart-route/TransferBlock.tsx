import { Plane, Car, Train, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Transfer } from "@/types/aiSmartRouteApi";

interface TransferBlockProps {
  transfer: Transfer;
}

const TransferBlock = ({ transfer }: TransferBlockProps) => {
  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'flight':
        return <Plane className="h-4 w-4" />;
      case 'drive':
        return <Car className="h-4 w-4" />;
      case 'transit':
        return <Train className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTransportColor = (mode: string) => {
    switch (mode) {
      case 'flight':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'drive':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'transit':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="bg-yellow-50 border-yellow-200 border-l-4 border-l-yellow-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getTransportIcon(transfer.mode)}
              <Badge className={`text-xs ${getTransportColor(transfer.mode)}`}>
                {transfer.mode.charAt(0).toUpperCase() + transfer.mode.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="font-medium text-sm">
                {transfer.from} → {transfer.to}
              </p>
              <p className="text-xs text-gray-600">
                {transfer.distance_km.toLocaleString()} km • {formatDuration(transfer.duration_minutes)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{transfer.time}</p>
            {transfer.overnight && (
              <Badge className="text-xs bg-indigo-100 text-indigo-800 border-indigo-300">
                Overnight
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferBlock;