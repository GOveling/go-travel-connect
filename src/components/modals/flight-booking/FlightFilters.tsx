import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FlightFiltersProps {
  filters: {
    maxPrice: number;
    maxTransfers: number;
    airlines: string[];
    timeOfDay: string;
  };
  onFiltersChange: (filters: any) => void;
  maxPrice: number;
  airlines: string[];
  currency: string;
}

const FlightFilters = ({
  filters,
  onFiltersChange,
  maxPrice,
  airlines,
  currency
}: FlightFiltersProps) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleAirline = (airline: string) => {
    const newAirlines = filters.airlines.includes(airline)
      ? filters.airlines.filter(a => a !== airline)
      : [...filters.airlines, airline];
    updateFilter('airlines', newAirlines);
  };

  const clearFilters = () => {
    onFiltersChange({
      maxPrice: 0,
      maxTransfers: 2,
      airlines: [],
      timeOfDay: 'any'
    });
  };

  const hasActiveFilters = 
    filters.maxPrice > 0 || 
    filters.maxTransfers < 2 || 
    filters.airlines.length > 0 || 
    filters.timeOfDay !== 'any';

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Maximum Price</Label>
            <Badge variant="outline" className="text-xs">
              {filters.maxPrice > 0 ? `${currency} ${filters.maxPrice}` : 'Any'}
            </Badge>
          </div>
          <Slider
            value={[filters.maxPrice || maxPrice]}
            max={maxPrice}
            min={0}
            step={50}
            onValueChange={(value) => updateFilter('maxPrice', value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currency} 0</span>
            <span>{currency} {maxPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Transfers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Maximum Stops</Label>
            <Badge variant="outline" className="text-xs">
              {filters.maxTransfers === 0 ? 'Direct only' : 
               filters.maxTransfers === 1 ? 'Up to 1 stop' : 
               `Up to ${filters.maxTransfers} stops`}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map(transfers => (
              <Button
                key={transfers}
                variant={filters.maxTransfers === transfers ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('maxTransfers', transfers)}
                className="text-xs"
              >
                {transfers === 0 ? 'Direct' : 
                 transfers === 1 ? '1 stop' : 
                 '2+ stops'}
              </Button>
            ))}
          </div>
        </div>

        {/* Airlines */}
        {airlines.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Airlines</Label>
              {filters.airlines.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filters.airlines.length} selected
                </Badge>
              )}
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {airlines.map(airline => (
                <div key={airline} className="flex items-center space-x-2">
                  <Checkbox
                    id={airline}
                    checked={filters.airlines.includes(airline)}
                    onCheckedChange={() => toggleAirline(airline)}
                  />
                  <Label htmlFor={airline} className="text-sm cursor-pointer">
                    {airline}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time of Day */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Departure Time</Label>
          <Select value={filters.timeOfDay} onValueChange={(value) => updateFilter('timeOfDay', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
              <SelectItem value="evening">Evening (6PM - 12AM)</SelectItem>
              <SelectItem value="night">Night (12AM - 6AM)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.maxPrice > 0 && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  Max {currency} {filters.maxPrice}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('maxPrice', 0)}
                  />
                </Badge>
              )}
              {filters.maxTransfers < 2 && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  {filters.maxTransfers === 0 ? 'Direct only' : 'Max 1 stop'}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('maxTransfers', 2)}
                  />
                </Badge>
              )}
              {filters.airlines.map(airline => (
                <Badge key={airline} variant="secondary" className="text-xs flex items-center gap-1">
                  {airline}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => toggleAirline(airline)}
                  />
                </Badge>
              ))}
              {filters.timeOfDay !== 'any' && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  {filters.timeOfDay}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('timeOfDay', 'any')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FlightFilters;