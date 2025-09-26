import { Clock, Lightbulb, Star, MapPin, Sparkles, CheckCircle } from "lucide-react";
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
          <div className="space-y-3">
            <div className="flex items-center space-x-1 mb-2">
              <Lightbulb className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-800">Sugerencias AI V2:</span>
              <Badge variant="outline" className="text-xs">
                {freeBlock.suggestions.filter(s => !s.synthetic).length} reales
              </Badge>
            </div>
            <div className="space-y-3">
              {freeBlock.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    suggestion.synthetic
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {suggestion.synthetic ? (
                          <Sparkles className="h-4 w-4 text-blue-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        <span className="font-medium text-sm">{suggestion.name}</span>
                      </div>
                      <Badge 
                        variant={suggestion.synthetic ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {suggestion.synthetic ? "IA" : "Real"}
                      </Badge>
                    </div>
                    {suggestion.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-current text-yellow-400" />
                        <span className="text-sm font-medium">{suggestion.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                    {suggestion.reason}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{suggestion.eta_minutes}min caminando</span>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {suggestion.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
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