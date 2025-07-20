import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Plane, Clock, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface FlightResult {
  price: number;
  airline: string;
  departure_at: string;
  return_at?: string;
  duration?: number;
  transfers: number;
  link: string;
  origin: string;
  destination: string;
  found_at: string;
}

interface FlightResultCardProps {
  flight: FlightResult;
  currency: string;
  searchParams: {
    from: string;
    to: string;
    departDate: string;
    returnDate?: string;
    passengers: number;
  };
}

const FlightResultCard = ({ flight, currency, searchParams }: FlightResultCardProps) => {
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return '--:--';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd');
    } catch {
      return '--';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '--';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTransfersText = (transfers: number) => {
    if (transfers === 0) return "Direct";
    if (transfers === 1) return "1 stop";
    return `${transfers} stops`;
  };

  const handleBookFlight = () => {
    // Open Aviasales link in new tab
    window.open(flight.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Airline and Price Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">{flight.airline}</span>
              </div>
              <Badge variant={flight.transfers === 0 ? "default" : "secondary"} className="text-xs">
                {getTransfersText(flight.transfers)}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {currency} {flight.price.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                per person
              </div>
            </div>
          </div>

          <Separator />

          {/* Flight Details */}
          <div className="space-y-3">
            {/* Outbound Flight */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-mono text-lg font-semibold">
                    {formatTime(flight.departure_at)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {flight.origin}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(flight.departure_at)}
                  </div>
                </div>
                
                <div className="flex flex-col items-center px-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    {formatDuration(flight.duration)}
                  </div>
                  <div className="w-16 h-px bg-muted flex items-center justify-center relative">
                    <ArrowRight className="w-4 h-4 bg-background text-muted-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getTransfersText(flight.transfers)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-mono text-lg font-semibold">
                    {flight.return_at ? formatTime(flight.return_at) : '--:--'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {flight.destination}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {flight.return_at ? formatDate(flight.return_at) : '--'}
                  </div>
                </div>
              </div>
            </div>

            {/* Return Flight if applicable */}
            {searchParams.returnDate && flight.return_at && (
              <>
                <Separator className="my-2" />
                <div className="flex items-center justify-between opacity-75">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-mono text-sm">
                        {formatTime(flight.return_at)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {flight.destination}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center px-4">
                      <div className="w-16 h-px bg-muted flex items-center justify-center relative">
                        <ArrowRight className="w-4 h-4 bg-background text-muted-foreground rotate-180" />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Return
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="font-mono text-sm">
                        {formatTime(flight.departure_at)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {flight.origin}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Found {format(new Date(flight.found_at), 'MMM dd, yyyy')}
            </div>
            <Button onClick={handleBookFlight} className="flex items-center gap-2">
              Book on Aviasales
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightResultCard;