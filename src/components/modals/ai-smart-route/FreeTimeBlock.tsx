import { Clock, Lightbulb, Star, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FreeBlock } from "@/types/aiSmartRouteApi";

interface FreeTimeBlockProps {
  freeBlock: FreeBlock;
}

const FreeTimeBlock = ({ freeBlock }: FreeTimeBlockProps) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-green-800">Tiempo libre</span>
            <Badge className="text-xs bg-green-100 text-green-800 border-green-300">
              {formatDuration(freeBlock.duration_minutes)}
            </Badge>
          </div>
          <span className="text-xs text-green-600">
            {formatTime(freeBlock.start_time)} - {formatTime(freeBlock.end_time)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {freeBlock.note && (
          <p className="text-sm text-green-700 mb-3">{freeBlock.note}</p>
        )}
        
        {freeBlock.suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1 mb-2">
              <Lightbulb className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-800">Sugerencias:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {freeBlock.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs ${
                    suggestion.synthetic
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-white text-gray-800 border border-gray-200 cursor-pointer hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="h-3 w-3" />
                  <span className="font-medium">{suggestion.name}</span>
                  {suggestion.rating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-2 w-2 fill-current text-yellow-400" />
                      <span>{suggestion.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <span className="text-gray-500">• {suggestion.eta_minutes}min</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FreeTimeBlock;