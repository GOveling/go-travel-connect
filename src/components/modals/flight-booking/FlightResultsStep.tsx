import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Clock, MapPin, Plane, ExternalLink, Filter } from "lucide-react";
import FlightResultCard from "./FlightResultCard";
import FlightFilters from "./FlightFilters";
import { useLanguage } from "@/contexts/LanguageContext";

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

interface FlightResultsStepProps {
  results: FlightResult[];
  currency: string;
  isLoading: boolean;
  error?: string;
  onBack: () => void;
  onNewSearch: () => void;
  searchParams: {
    from: string;
    to: string;
    departDate: string;
    returnDate?: string;
    passengers: number;
  };
}

const FlightResultsStep = ({
  results,
  currency,
  isLoading,
  error,
  onBack,
  onNewSearch,
  searchParams
}: FlightResultsStepProps) => {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState("price");
  const [filters, setFilters] = useState({
    maxPrice: 0,
    maxTransfers: 2,
    airlines: [] as string[],
    timeOfDay: 'any'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort results
  const filteredResults = results
    .filter(flight => {
      if (filters.maxPrice > 0 && flight.price > filters.maxPrice) return false;
      if (flight.transfers > filters.maxTransfers) return false;
      if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'duration':
          return (a.duration || 0) - (b.duration || 0);
        case 'transfers':
          return a.transfers - b.transfers;
        case 'departure':
          return new Date(a.departure_at).getTime() - new Date(b.departure_at).getTime();
        default:
          return 0;
      }
    });

  const uniqueAirlines = [...new Set(results.map(flight => flight.airline))];
  const maxPrice = Math.max(...results.map(flight => flight.price));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h2 className="text-xl font-semibold">Searching Flights...</h2>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-6 bg-muted rounded w-40"></div>
                  </div>
                  <div className="h-8 bg-muted rounded w-20"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-muted rounded w-16"></div>
                  <div className="h-4 bg-muted rounded w-4"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h2 className="text-xl font-semibold">Search Error</h2>
        </div>
        
        <Card className="p-6 text-center">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Unable to search flights</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={onNewSearch} className="mt-4">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Flight Results</h2>
            <p className="text-sm text-muted-foreground">
              {searchParams.from} <ArrowRight className="w-4 h-4 inline mx-1" /> {searchParams.to}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onNewSearch}>
          New Search
        </Button>
      </div>

      {/* Search Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{searchParams.from} → {searchParams.to}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{searchParams.departDate}</span>
              {searchParams.returnDate && <span>- {searchParams.returnDate}</span>}
            </div>
            <Badge variant="secondary">{searchParams.passengers} passenger{searchParams.passengers > 1 ? 's' : ''}</Badge>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {filteredResults.length} flights found
          </Badge>
        </div>
      </Card>

      {/* Filters and Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price (Low to High)</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="transfers">Fewest Stops</SelectItem>
              <SelectItem value="departure">Departure Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {results.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Prices from {currency} {Math.min(...results.map(f => f.price))} - {currency} {Math.max(...results.map(f => f.price))}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <FlightFilters
          filters={filters}
          onFiltersChange={setFilters}
          maxPrice={maxPrice}
          airlines={uniqueAirlines}
          currency={currency}
        />
      )}

      {/* Results */}
      {filteredResults.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Plane className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
            <div>
              <h3 className="text-lg font-semibold">No flights found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search criteria
              </p>
            </div>
            <Button onClick={() => setFilters({ maxPrice: 0, maxTransfers: 2, airlines: [], timeOfDay: 'any' })}>
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((flight, index) => (
            <FlightResultCard
              key={`${flight.origin}-${flight.destination}-${flight.departure_at}-${index}`}
              flight={flight}
              currency={currency}
              searchParams={searchParams}
            />
          ))}
        </div>
      )}

      {/* Note about data */}
      {results.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm text-amber-800">
              <p className="font-medium">About these prices</p>
              <p>Prices shown are from cached data and may be 2-7 days old. Final prices and availability will be confirmed on Aviasales.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FlightResultsStep;