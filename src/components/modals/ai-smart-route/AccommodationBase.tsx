import { Building, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BaseAccommodation } from "@/types/aiSmartRouteApi";

interface AccommodationBaseProps {
  base: BaseAccommodation;
}

const AccommodationBase = ({ base }: AccommodationBaseProps) => {
  const getBaseTypeLabel = (type: string) => {
    switch (type) {
      case 'hotel_from_cluster':
        return 'Hotel recomendado';
      case 'virtual_base':
        return 'Base virtual';
      case 'smart_centroid':
        return 'Centro geográfico';
      default:
        return 'Base del día';
    }
  };

  const getBaseTypeColor = (type: string) => {
    switch (type) {
      case 'hotel_from_cluster':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'virtual_base':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'smart_centroid':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className="bg-indigo-50 border-indigo-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building className="h-4 w-4 text-indigo-600" />
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm text-indigo-900">{base.name}</p>
                <Badge className={`text-xs ${getBaseTypeColor(base.type)}`}>
                  {getBaseTypeLabel(base.type)}
                </Badge>
              </div>
              {base.address && (
                <p className="text-xs text-indigo-600">{base.address}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {base.rating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-current text-yellow-400" />
                <span className="text-xs text-indigo-700">{base.rating.toFixed(1)}</span>
              </div>
            )}
            <MapPin className="h-3 w-3 text-indigo-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccommodationBase;